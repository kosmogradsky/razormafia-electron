function uint8ArrayFromUint32(uint32) {
  const byte1 = 0xff & uint32;
  const byte2 = 0xff & (uint32 >> 8);
  const byte3 = 0xff & (uint32 >> 16);
  const byte4 = 0xff & (uint32 >> 24);

  return new Uint8Array([byte4, byte3, byte2, byte1]);
}

function writeStringToSocket(socket, strMessage) {
  const textEncoder = new TextEncoder();
  const textBytes = textEncoder.encode(strMessage);
  const lengthBytes = uint8ArrayFromUint32(textBytes.length);
  const resultBytes = new Uint8Array(lengthBytes.length + textBytes.length);
  resultBytes.set(lengthBytes);
  resultBytes.set(textBytes, lengthBytes.length);

  socket.write(resultBytes);
}

export { writeStringToSocket };