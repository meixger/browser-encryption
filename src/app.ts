import { encrypt, decrypt } from "./encryption";

export function setupApp(element: HTMLDivElement) {
  const btnEncrypt = element.querySelector<HTMLButtonElement>('#encrypt')!
  const btnDecrypt = element.querySelector<HTMLButtonElement>('#decrypt')!
  const btnCopy = element.querySelector<HTMLButtonElement>('#copy')!
  const txtPassword = element.querySelector<HTMLInputElement>('#password')!
  const btnShowpassword = element.querySelector<HTMLButtonElement>('#showpassword')!
  const txtInput = element.querySelector<HTMLTextAreaElement>('#input')!
  const txtOutput = element.querySelector<HTMLTextAreaElement>('#output')!
  
  btnEncrypt.addEventListener('click', () => encrypt(txtInput.value, txtPassword.value).then(v => txtOutput.value = v))
  
  btnDecrypt.addEventListener('click', () => decrypt(txtInput.value, txtPassword.value).then(v => txtOutput.value = v))
  
  btnShowpassword.addEventListener('click', () => {
    if (txtPassword.type === "password") {
      txtPassword.type = "text";
      btnShowpassword.innerText = "Hide";
    } else {
      txtPassword.type = "password";
      btnShowpassword.innerText = "Show";
    }
  })

  btnCopy.addEventListener('click', () => {
    navigator.clipboard.writeText(txtOutput.value);
    const btnText = btnCopy.innerText;
    btnCopy.innerText = "Result copied to clipboard!";
    setTimeout(() => btnCopy.innerText = btnText, 3000);
  })
}
