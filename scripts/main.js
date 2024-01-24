const myImage = document.querySelector("img");
/*
myImage.onclick = () => {
    const mySrc = myImage.getAttribute("src");
    if (mySrc === "images/icon.jpg") {
        myImage.setAttribute("src", "images/violin.jpg");
    } else {
        myImage.setAttribute("src", "images/icon.jpg");
    }
};
*/
let myButton = document.querySelector("button");
let myHeading = document.querySelector("h1");

/*
function setUserName() {
    const myName = prompt("Please enter your name.");
    if (!myName) {
        setUserName();
    } else {
    localStorage.setItem("name", myName);
    myHeading.textContent = `Mozilla is cool, ${myName}`;
    }
}

if (!localStorage.getItem("name")) {
    setUserName();
} else {
    const storedName = localStorage.getItem("name");
    myHeading.textContent = `Mozilla is cool, ${storedName}`;
}

myButton.onclick = () => {
    setUserName();
};

const button = document.querySelector("button");
button.addEventListener("click", updateName);

function updateName() {
    const name = prompt("Enter a new name");
    button.textContent = `Player 1: ${name}`;
}

const buttons = document.querySelectorAll("button");

function createParagraph() {
    const para = document.createElement("p");
    para.textContent = "You clicked the button";
    document.body.appendChild(para);
}

for (const button of buttons) {
    button.addEventListener("click", createParagraph);
}

*/