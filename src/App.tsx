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

interface CharElement {
  id: number;
  char: string;
  x: number;
  y: number;
  clientId?: string;
  fontSize?: number;
}

interface Player {
  id: number;
  x: number;
  y: number;
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
  const [displayCircles, setDisplayCircles] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [circleRadius, setCircleRadius] = useState(120);
  const [charElements, setCharElements] = useState<CharElement[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [fontSize, setFontSize] = useState(360);
  const [displayPlayer, setDisplayPlayer] = useState(false);
  const [playerRadius, setPlayerRadius] = useState(0);
  const [playerVisible, setPlayerVisible] = useState(false);
  const [prevPlayerX, setPrevPlayerX] = useState(0);
  const [prevPlayerY, setPrevPlayerY] = useState(0);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeKeys, setActiveKeys] = useState(new Set());
  const [player, setPlayer] = useState<Player | null>(null);
  const prevPlayerRef = useRef<Player | null>(null);
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
                data: {
                  innerWidth: window.innerWidth,
                  innerHeight: window.innerHeight,
                },
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
          } else if (message.type === "updateCharactor") {
            const { id, char, x, y, clientId, fontSize } = message.data;
            setCharElements((prevChars) => {
              const charIndex = prevChars.findIndex((d) => d.id === id);
              if (charIndex !== -1) {
                const updatedChars = [...prevChars];
                updatedChars[charIndex] = { ...updatedChars[charIndex], char, x, y, clientId, fontSize };
                return updatedChars;
              } else {
                return [...prevChars, { id, char, x, y, clientId, fontSize }];
              }
            });
          } else if (message.type === "fontSize") {
            setFontSize(message.fontSize);
          } else if (message.type === "circleRadius") {
            setCircleRadius(message.radius);
          } else if (message.type === "clearDisplay") {
            setCircles([]);
            setCharElements([]);
          } else if (message.type === "player") {
            const { id, x, y, visible } = message.position;
            setPlayer((prevPlayer) => {
              if (prevPlayer && prevPlayer.id === id) {
                return { ...prevPlayer, x, y };
              } else {
                return { id, x, y };
              }
            });
            setPlayerVisible(visible);
          } else if (message.type === "playerRadius") {
            setPlayerRadius(message.radius);
          } else if (message.type === "displayPlayer") {
            setDisplayPlayer(message.display);
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
        type: "windowResize",
        data: {
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,},
      });
      ws.current?.send(widthInfo);
    };

    window.addEventListener("resize", handleResize);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (["w", "a", "s", "d"].includes(e.key)) {
        setActiveKeys((prevKeys) => {
          if (!prevKeys.has(e.key)) {
            const newKeys = new Set(prevKeys);
            newKeys.add(e.key);
            ws.current?.send(JSON.stringify({ type: "startMovingPlayer", key: e.key }));
            return newKeys;
          }
          return prevKeys;
        });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (["w", "a", "s", "d"].includes(e.key)) {
        setActiveKeys((prevKeys) => {
          if (prevKeys.has(e.key)) {
            const newKeys = new Set(prevKeys);
            newKeys.delete(e.key);
            ws.current?.send(JSON.stringify({ type: "stopMovingPlayer", key: e.key }));
            return newKeys;
          }
          return prevKeys;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      ws.current?.close();
    };
  }, []);

  useEffect(() => {
    if (player) {
      if (player.x !== prevPlayerX || player.y !== prevPlayerY) {
        setPrevPlayerX(player.x);
        setPrevPlayerY(player.y);
      }
    }
  }, [player, prevPlayerX, prevPlayerY]);

  useEffect(() => {
    prevPlayerRef.current = player;
  }, [player]);

  const toggleDisplay = () => {
    setDisplayCircles(!displayCircles);
  };

  const handleFontSizeChange = (increase: boolean) => {
    setFontSize((prevSize) => {
      const newSize = increase ? prevSize * 1.25 : prevSize * 0.75;
      ws.current?.send(JSON.stringify({
        type: "fontSize",
        fontSize: newSize,
      }));
      return newSize;
    });
  };

  const handleCircleRadiusChange = (increase: boolean) => {
    setCircleRadius((prevRadius) => {
      const newRadius = increase ? prevRadius * 1.25 : prevRadius * 0.75;
      ws.current?.send(JSON.stringify({
        type: "circleRadius",
        radius: newRadius,
      }));
      return newRadius;
    });
  };

  const togglePlayerDisplay = () => {
    const newDisplay = !displayPlayer;
    setDisplayPlayer(newDisplay);
    ws.current?.send(JSON.stringify({ type: "displayPlayer", display: newDisplay }));
  };
  
  return (
    <div
      className="App"
      style={{ position: "relative", height: "100vh", overflow: "hidden" }}
    >
      <div style={{ position: "absolute", right: 20, top: 20, zIndex: 1000, display: "flex", gap: "10px" }}>
        <button onClick={toggleDisplay}>
          {displayCircles ? "Strings" : "Circles"}
        </button>
        <button onClick={() => handleFontSizeChange(true)}>Font +</button>
        <button onClick={() => handleFontSizeChange(false)}>Font -</button>
        <button onClick={() => handleCircleRadiusChange(true)}>Circle +</button>
        <button onClick={() => handleCircleRadiusChange(false)}>Circle -</button>
        <button onClick={togglePlayerDisplay}>
          {displayPlayer ? "Hide Player" : "Show Player"}
        </button>
      </div>
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
          {charElements.map((char, index) => (
            <div
              key={index}
              style={{
                position: "absolute",
                left: `${char.x}px`,
                top: `${char.y}px`,
                fontSize: `${char.fontSize}px`,
                fontFamily: "monospace",
              }}
            >
              {char.char}
            </div>
          ))}
        </>
      )}
      {displayPlayer && player && playerVisible && (
        <div
          style={{
            position: "absolute",
            left: `${player.x}px`,
            top: `${player.y}px`,
            width: `${playerRadius * 2}px`,
            height: `${playerRadius * 2}px`,
            borderRadius: "50%",
            backgroundColor: "#607d8b",
            transition: prevPlayerRef.current ? "all 0.1s linear" : "none",
          }}
        ></div>
      )}
    </div>
  );
};

export default App;
