function uint32FromUint8Array(uint8Arr) {
  const byte1 = uint8Arr[3];
  const byte2 = uint8Arr[2];
  const byte3 = uint8Arr[1];
  const byte4 = uint8Arr[0];

  const part1 = byte1;
  const part2 = byte2 << 8;
  const part3 = byte3 << 16;
  const part4 = byte4 << 24;
  const uint32 = part1 | part2 | part3 | part4;

  return uint32;
}

function readMessagesFromSocket(messagesUint8Arr) {
  const textDecoder = new TextDecoder();
  const messages = [];

  let remainingBytes = messagesUint8Arr;
  while (remainingBytes.length > 0) {
    const messageLengthBytes = remainingBytes.subarray(0, 4);
    const messageLength = uint32FromUint8Array(messageLengthBytes);
    const messageBytes = remainingBytes.subarray(4, 4 + messageLength);
    const messageStr = textDecoder.decode(messageBytes);
    messages.push(messageStr);

    remainingBytes = remainingBytes.subarray(4 + messageLength);
  }

  return messages;
}

export { readMessagesFromSocket };