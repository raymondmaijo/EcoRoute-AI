import { Router } from "express";

const router = Router();

router.get("/traffic", async (req, res) => {
  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);
  const apiKey = process.env["TOMTOM_API_KEY"];

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    res.status(400).json({ status: "unavailable", message: "A valid latitude and longitude are required." });
    return;
  }

  if (!apiKey) {
    res.json({
      status: "unavailable",
      message: "Live traffic is not connected. Add a free TomTom Traffic API key to enable current corridor traffic.",
    });
    return;
  }

  try {
    const endpoint = new URL("https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json");
    endpoint.searchParams.set("point", `${lat},${lon}`);
    endpoint.searchParams.set("unit", "KMPH");
    endpoint.searchParams.set("key", apiKey);
    const response = await fetch(endpoint);
    const payload = await response.json() as {
      flowSegmentData?: {
        currentSpeed?: number;
        freeFlowSpeed?: number;
        confidence?: number;
        frc?: string;
        roadClosure?: boolean;
        coordinates?: { coordinate?: Array<{ latitude?: number; longitude?: number }> };
      };
      error?: { description?: string };
    };

    if (!response.ok || !payload.flowSegmentData) {
      res.status(502).json({ status: "unavailable", message: payload.error?.description ?? "The traffic provider did not return a flow segment." });
      return;
    }

    const flow = payload.flowSegmentData;
    const currentSpeedKph = Number(flow.currentSpeed ?? 0);
    const freeFlowSpeedKph = Number(flow.freeFlowSpeed ?? 0);
    const congestion = freeFlowSpeedKph > 0 ? Math.min(1, Math.max(0, 1 - currentSpeedKph / freeFlowSpeedKph)) : 0;
    const segment = flow.coordinates?.coordinate?.[Math.floor((flow.coordinates.coordinate.length - 1) / 2)];

    res.json({
      status: "live",
      currentSpeedKph: Math.round(currentSpeedKph),
      freeFlowSpeedKph: Math.round(freeFlowSpeedKph),
      congestion: Number(congestion.toFixed(3)),
      label: congestion < 0.18 ? "Light" : congestion < 0.38 ? "Moderate" : congestion < 0.62 ? "Heavy" : "Severe",
      road: flow.frc ? `road class ${flow.frc}` : undefined,
      segment: segment ? { lat: segment.latitude, lon: segment.longitude } : undefined,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    res.status(502).json({ status: "unavailable", message: "The live traffic provider could not be reached." });
  }
});

export default router;