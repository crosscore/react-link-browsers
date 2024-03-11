// src/App.tsx
import React, { useEffect, useState, useRef } from "react";

const WEBSOCKET_URL = "ws://localhost:8080";

interface Circle {
  id: number;
  x: number;
  y: number;
  radius: number;
  color: string;
  visible: boolean;
}

interface PiDigit {
  id: number;
  digit: string;
  x: number;
  y: number;
  clientId?: string;
}

const colors = [
  "#F44336",
  "#E91E63",
  "#9C27B0",
  "#673AB7",
  "#3F51B5",
  "#2196F3",
  "#03A9F4",
  "#00BCD4",
  "#009688",
  "#4CAF50",
  "#8BC34A",
  "#CDDC39",
];

const App = () => {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [piDigits, setPiDigits] = useState<PiDigit[]>([]);
  const [displayCircles, setDisplayCircles] = useState(true);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connectWebSocket = () => {
      ws.current = new WebSocket(WEBSOCKET_URL);

      if (ws.current) {
        ws.current.onopen = () => {
          if (ws.current?.readyState === WebSocket.OPEN) {
            console.log(`ws.current.readyState: ${ws.current.readyState}`);
            ws.current.send(
              JSON.stringify({
                type: 'windowInfo',
                data: { innerWidth: window.innerWidth },
                headers: { 'x-client-width': window.innerWidth },
              })
            );
          }
        };
        ws.current.onmessage = (event) => {
          const message = JSON.parse(event.data);
          if (message.type === "updateCircle") {
            const { id, x, y, radius } = message.data;
            setCircles((prevCircles) => {
              const index = prevCircles.findIndex((circle) => circle.id === id);
              const visible = x + radius > 0 && x - radius < window.innerWidth;
              const colorIndex = id % colors.length;
              if (index !== -1) {
                const updatedCircles = [...prevCircles];
                updatedCircles[index] = {
                  ...updatedCircles[index],
                  x,
                  y,
                  radius,
                  color: colors[colorIndex],
                  visible,
                };
                return updatedCircles;
              } else {
                return [...prevCircles, { id, x, y, radius, color: colors[colorIndex], visible }];
              }
            });
          } else if (message.type === "updatePiDigit") {
            const { id, digit, x, y, clientId } = message.data;
            setPiDigits((prevDigits) => {
              const digitIndex = prevDigits.findIndex((d) => d.id === id);
              if (digitIndex !== -1) {
                const updatedDigits = [...prevDigits];
                updatedDigits[digitIndex] = { ...updatedDigits[digitIndex], digit, x, y, clientId };
                return updatedDigits;
              } else {
                return [...prevDigits, { id, digit, x, y, clientId }];
              }
            });
          }
        };
        ws.current.onclose = () => {
          console.log(`ws.current.readyState: ${ws.current?.readyState}`);
        };
      }
    };

    setTimeout(connectWebSocket, 1);

    const handleResize = () => {
      const widthInfo = JSON.stringify({
        type: "windowInfo",
        data: { innerWidth: window.innerWidth },
      });
      ws.current?.send(widthInfo);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      ws.current?.close();
    };
  }, []);

  const toggleDisplay = () => {
    setDisplayCircles(!displayCircles);
  };

  return (
    <div
      className="App"
      style={{ position: "relative", height: "100vh", overflow: "hidden" }}
    >
      <button
        onClick={toggleDisplay}
        style={{ position: "absolute", right: 20, top: 20, zIndex: 1000 }}
      >
        {displayCircles ? "Strings" : "Circles"}
      </button>
      {displayCircles ? (
        <>
          {circles.map(
            (circle) =>
              circle.visible && (
                <div
                  key={circle.id}
                  style={{
                    width: `${circle.radius * 2}px`,
                    height: `${circle.radius * 2}px`,
                    borderRadius: "50%",
                    backgroundColor: circle.color,
                    position: "absolute",
                    left: `${circle.x}px`,
                    top: `${circle.y}px`,
                    transform: "translate(-50%, -50%)",
                  }}
                ></div>
              )
          )}
        </>
      ) : (
        <>
          {piDigits.map((digit, index) => (
            <div
              key={index}
              style={{
                position: "absolute",
                left: `${digit.x}px`,
                top: `${digit.y}px`,
                fontSize: "40px",
                fontFamily: "Fira Code",
              }}
            >
              {digit.digit}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default App;
