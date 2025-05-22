import { useState } from "react";
import { ListSettings, SetSettings } from "../../wailsjs/go/src/app";

interface Settings {
  [key: string]: string;
}

const useSetting = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(false);

  const getSettings = async () => {
    setLoading(true);
    const response = await ListSettings();
    console.log("response", response);
    const settings = response.reduce((acc: Settings, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
    setSettings(settings);
    setLoading(false);
  };

  const setSetting = async (payload: Settings) => {
    setLoading(true);
    const settingData = Object.entries(payload).map(([key, value]) => ({ key, value }));
    await SetSettings(settingData);
    await getSettings();
    setLoading(false);
  };

  return { settings, getSettings, setSetting, loading }
};

export default useSetting;