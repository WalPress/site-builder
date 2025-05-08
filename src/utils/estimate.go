package utils

import (
	"bytes"
	"fmt"
	"math"
	"os/exec"
	"regexp"
	"strconv"
	"strings"
)

// EstimateStorageCost estimates the storage cost in WAL for a given file size in bytes.
func EstimateStorageCostF(fileSizeBytes int64) (float64, error) {
	binaryPath := getWalrusBinaryPath()
	// Execute the 'walrus info' command to retrieve storage pricing details.
	cmd := exec.Command(binaryPath, "info")
	var out bytes.Buffer
	cmd.Stdout = &out
	if err := cmd.Run(); err != nil {
		return 0, fmt.Errorf("failed to execute walrus info: %v", err)
	}

	output := out.String()

	// Regular expressions to extract pricing information.
	pricePerUnitRegex := regexp.MustCompile(`(?i)Price per encoded storage unit:\s*([\d.]+)\s*WAL`)
	writeFeeRegex := regexp.MustCompile(`(?i)Additional price for each write:\s*([\d,]+)\s*FROST`)
	storageUnitRegex := regexp.MustCompile(`(?i)Storage unit:\s*([\d.]+)\s*MiB`)

	// Extract price per storage unit in WAL.
	pricePerUnitMatch := pricePerUnitRegex.FindStringSubmatch(output)
	if len(pricePerUnitMatch) < 2 {
		return 0, fmt.Errorf("could not parse price per storage unit")
	}
	pricePerUnit, err := strconv.ParseFloat(pricePerUnitMatch[1], 64)
	if err != nil {
		return 0, fmt.Errorf("invalid price per storage unit: %v", err)
	}

	// Extract write fee in FROST.
	writeFeeMatch := writeFeeRegex.FindStringSubmatch(output)
	if len(writeFeeMatch) < 2 {
		return 0, fmt.Errorf("could not parse write fee")
	}
	writeFeeStr := strings.ReplaceAll(writeFeeMatch[1], ",", "")
	writeFeeFROST, err := strconv.ParseFloat(writeFeeStr, 64)
	if err != nil {
		return 0, fmt.Errorf("invalid write fee: %v", err)
	}

	// Extract storage unit size in MiB.
	storageUnitMatch := storageUnitRegex.FindStringSubmatch(output)
	if len(storageUnitMatch) < 2 {
		return 0, fmt.Errorf("could not parse storage unit size")
	}
	storageUnitMiB, err := strconv.ParseFloat(storageUnitMatch[1], 64)
	if err != nil {
		return 0, fmt.Errorf("invalid storage unit size: %v", err)
	}
	storageUnitBytes := storageUnitMiB * 1024 * 1024

	// Calculate the number of storage units required.
	units := float64(fileSizeBytes) / storageUnitBytes
	if fileSizeBytes%int64(storageUnitBytes) != 0 {
		units = float64(int(units) + 1)
	}

	// Convert write fee from FROST to WAL.
	writeFeeWAL := writeFeeFROST / 1_000_000_000

	// Total cost in WAL.
	totalCost := (units * pricePerUnit) + writeFeeWAL

	return totalCost, nil
}

// EstimateStorageCost calculates the estimated cost in WAL for storing a file of a given size in bytes.
func EstimateStorageCost(fileSizeBytes int64) float64 {
	const (
		storageUnitSizeBytes = 1 << 20 // 1 MiB
		pricePerUnitWAL      = 0.0001  // WAL per storage unit
		writeFeeFROST        = 20000   // FROST per write
		frostPerWAL          = 1_000_000_000
	)

	// Calculate the number of storage units needed (rounded up)
	units := int64(math.Ceil(float64(fileSizeBytes) / float64(storageUnitSizeBytes)))

	// Calculate the cost for storage units
	storageCostWAL := float64(units) * pricePerUnitWAL

	// Convert write fee from FROST to WAL
	writeFeeWAL := float64(writeFeeFROST) / float64(frostPerWAL)

	// Total cost is the sum of storage cost and write fee
	totalCostWAL := storageCostWAL + writeFeeWAL

	return totalCostWAL
}
