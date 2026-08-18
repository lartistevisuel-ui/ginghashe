import { ImageResponse } from "next/og";

export const runtime = "edge";

const ROT = [-19, 13, -9, 17, -14, 8, -12, 15];
const COLORS = ["#141414", "#2a2a2a", "#1c1c22", "#333", "#0f0f14"];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const raw = (searchParams.get("c") || "").toUpperCase().slice(0, 8);
  const code = raw || "KINGHASH";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#e9e9ef",
          backgroundImage:
            "linear-gradient(112deg, rgba(60,180,90,0) 40%, rgba(60,180,90,0.35) 41%, rgba(60,180,90,0) 43%)," +
            "linear-gradient(155deg, rgba(20,20,20,0) 55%, rgba(20,20,20,0.22) 56%, rgba(20,20,20,0) 58%)," +
            "linear-gradient(95deg, rgba(120,80,180,0) 68%, rgba(120,80,180,0.25) 69%, rgba(120,80,180,0) 71%)",
        }}
      >
        {code.split("").map((ch, i) => (
          <span
            key={i}
            style={{
              fontSize: 78,
              fontWeight: 800,
              color: COLORS[i % COLORS.length],
              transform: `rotate(${ROT[i % ROT.length]}deg)`,
              margin: "0 3px",
              display: "flex",
            }}
          >
            {ch}
          </span>
        ))}
      </div>
    ),
    { width: 440, height: 150 }
  );
}
