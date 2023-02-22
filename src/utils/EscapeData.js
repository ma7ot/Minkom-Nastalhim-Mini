import sqlstring from "sqlstring";

const EscapeData = data => {
  if (typeof data === "string") {
    // Escape special characters
    const escapedString = sqlstring.escape(data);

    // Remove surrounding quotes and backslashes
    return escapedString.slice(1, escapedString.length - 1);
  } else if (typeof data === "number") {
    return data;
  } else if (typeof data === "boolean") {
    return data;
  } else if (Array.isArray(data)) {
    // Map over each item in the array and escape it recursively
    return data.map(item => EscapeData(item));
  } else if (typeof data === "object" && data !== null) {
    // Create a new object to hold the escaped data
    const escapedData = {};

    // Loop over each key in the object and escape the corresponding value
    for (const key in data) {
      escapedData[key] = EscapeData(data[key]);
    }

    return escapedData;
  }

  // Return any other data types unchanged
  return data;
};

export default EscapeData;