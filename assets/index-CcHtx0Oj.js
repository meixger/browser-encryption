const buff_to_base64 = (buff) => btoa(
  new Uint8Array(buff).reduce(
    (data, byte) => data + String.fromCharCode(byte),
    ""
  )
);
const base64_to_buf = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
async function encrypt(value, password, iterations = 6e5, keySize = 256) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await getKeyAesGcm(password, salt, iterations, keySize);
  const encryptedContent = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv
    },
    key,
    new TextEncoder().encode(value)
  );
  const encryptedContentArr = new Uint8Array(encryptedContent);
  const buff = new Uint8Array(
    salt.byteLength + iv.byteLength + encryptedContentArr.byteLength
  );
  buff.set(salt, 0);
  buff.set(iv, salt.byteLength);
  buff.set(encryptedContentArr, salt.byteLength + iv.byteLength);
  const base64Buff = buff_to_base64(buff);
  return base64Buff;
}
async function decrypt(value, password, iterations = 6e5, keySize = 256) {
  const encryptedDataBuff = base64_to_buf(value);
  const salt = encryptedDataBuff.slice(0, 16);
  const iv = encryptedDataBuff.slice(16, 16 + 12);
  const data = encryptedDataBuff.slice(16 + 12);
  const key = await getKeyAesGcm(password, salt, iterations, keySize);
  const decryptedContent = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv
    },
    key,
    data
  );
  return new TextDecoder().decode(decryptedContent);
}
async function getKeyAesGcm(password, salt, iterations, keySize) {
  const baseKey = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
    "deriveKey"
  ]);
  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256"
    },
    baseKey,
    { name: "AES-GCM", length: keySize },
    false,
    // extractable
    ["encrypt", "decrypt"]
  );
  return key;
}
function setupApp(element) {
  const btnEncrypt = element.querySelector("#encrypt");
  const btnDecrypt = element.querySelector("#decrypt");
  const btnCopy = element.querySelector("#copy");
  const txtPassword = element.querySelector("#password");
  const btnShowpassword = element.querySelector("#showpassword");
  const txtInput = element.querySelector("#input");
  const txtOutput = element.querySelector("#output");
  btnEncrypt.addEventListener("click", () => encrypt(txtInput.value, txtPassword.value).then((v) => txtOutput.value = v));
  btnDecrypt.addEventListener("click", () => decrypt(txtInput.value, txtPassword.value).then((v) => txtOutput.value = v));
  btnShowpassword.addEventListener("click", () => {
    if (txtPassword.type === "password") {
      txtPassword.type = "text";
      btnShowpassword.innerText = "Hide";
    } else {
      txtPassword.type = "password";
      btnShowpassword.innerText = "Show";
    }
  });
  btnCopy.addEventListener("click", () => {
    navigator.clipboard.writeText(txtOutput.value);
    const btnText = btnCopy.innerText;
    btnCopy.innerText = "Result copied to clipboard!";
    setTimeout(() => btnCopy.innerText = btnText, 3e3);
  });
}
setupApp(document.querySelector("#app"));
