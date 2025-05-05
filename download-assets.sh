#!/bin/bash

# Script to download Sui CLI binaries into the assets folder.
# Run this script from the cli-runner directory.

set -e # Exit immediately if a command exits with a non-zero status.

# --- Configuration ---
ENV="testnet"
VERSION="v1.48.0"
BASE_URL="https://github.com/MystenLabs/sui/releases/download/${ENV}-${VERSION}"
ASSETS_DIR="./assets"
TMP_DIR=$(mktemp -d) # Create a temporary directory for downloads

# Cleanup function to remove temporary directory on exit
cleanup() {
  echo "Cleaning up temporary directory: ${TMP_DIR}"
  rm -rf "${TMP_DIR}"
}
trap cleanup EXIT # Register cleanup function to run on script exit

# --- Platforms to download ---
# Format: "os-arch;archive_filename_suffix;binary_name_in_archive;target_dir_name"
PLATFORMS=(
  "linux-amd64;ubuntu-x86_64.tgz;sui;linux-amd64"
  "darwin-amd64;macos-x86_64.tgz;sui;darwin-amd64"
  "darwin-arm64;macos-arm64.tgz;sui;darwin-arm64"
  "windows-amd64;windows-x86_64.tgz;sui.exe;windows-amd64"
)

# --- Download and Extract ---
echo "Starting Sui binary download process..."

for platform_info in "${PLATFORMS[@]}"; do
  IFS=';' read -r os_arch suffix binary_name target_dir_name <<< "$platform_info"

  ARCHIVE_NAME="sui-${ENV}-${VERSION}-${suffix}"
  DOWNLOAD_URL="${BASE_URL}/${ARCHIVE_NAME}"
  TARGET_DIR="${ASSETS_DIR}/${target_dir_name}"
  TARGET_BINARY_PATH="${TARGET_DIR}/${binary_name}"
  DOWNLOAD_PATH="${TMP_DIR}/${ARCHIVE_NAME}"

  echo "--------------------------------------------------"
  echo "Processing: ${os_arch}"
  echo "  Target Dir: ${TARGET_DIR}"
  echo "  Binary: ${binary_name}"
  echo "  URL: ${DOWNLOAD_URL}"
  echo "--------------------------------------------------"

  # Create target directory
  mkdir -p "${TARGET_DIR}"
  echo "  Ensured target directory exists: ${TARGET_DIR}"

  # Download archive
  echo "  Downloading archive to ${DOWNLOAD_PATH}..."
  curl -L -f --progress-bar -o "${DOWNLOAD_PATH}" "${DOWNLOAD_URL}"
  if [ $? -ne 0 ]; then
    echo "  ERROR: Failed to download ${ARCHIVE_NAME}"
    exit 1
  fi
  echo "  Download complete."

  # Extract the specific binary
  echo "  Extracting ${binary_name} to ${TARGET_DIR}..."
  # Use -C to change directory for extraction, specify the exact member to extract
  tar -xzf "${DOWNLOAD_PATH}" -C "${TARGET_DIR}" "${binary_name}"
   if [ $? -ne 0 ]; then
    echo "  ERROR: Failed to extract ${binary_name} from ${ARCHIVE_NAME}"
    # Clean up the potentially incomplete extraction attempt
    rm -f "${TARGET_BINARY_PATH}"
    exit 1
  fi
   echo "  Extraction complete: ${TARGET_BINARY_PATH}"

  # Set execute permissions (for non-Windows)
  if [[ "${target_dir_name}" != "windows-amd64" ]]; then
    echo "  Setting execute permission..."
    chmod +x "${TARGET_BINARY_PATH}"
    echo "  Permissions set."
  fi

  echo "  Successfully processed ${os_arch}."

done

echo "=================================================="
echo "All assets downloaded and extracted successfully."
echo "=================================================="

exit 0