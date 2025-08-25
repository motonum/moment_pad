import { useState } from "react";
import "./App.css";

function App() {
  const [text, setText] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (text && !isCopied) {
      navigator.clipboard.writeText(text).then(() => {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 2000); // 2 seconds
      });
    }
  };

  return (
    <div className="container">
      <button className="copy-button" onClick={handleCopy} disabled={isCopied || !text}>
        {isCopied ? "Copied!" : "Copy"}
      </button>
      <textarea
        className="memo-pad"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write something..."
      />
    </div>
  );
}

export default App;
