function t(e,r="Enter"){function n(s){s.key===r&&(e.focus(),e.click())}return document.addEventListener("keypress",n),{destroy(){document.removeEventListener("keypress",n)}}}export{t as c};
