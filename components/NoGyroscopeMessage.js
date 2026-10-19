import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

// Shown on devices without a motion sensor, with a QR code so the page can be
// opened on a phone straight away.
const NoGyroscopeMessage = () => {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  return (
    <div className="message message--qr">
      This turntable is played by spinning your phone. Scan to open it there.
      {url && (
        <QRCodeSVG
          className="message-qr"
          value={url}
          size={96}
          marginSize={2}
          fgColor="black"
          bgColor="#f2e4da"
          title="QR code linking to this page"
        />
      )}
    </div>
  );
};

export default NoGyroscopeMessage;
