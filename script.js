const homePageCurrentImage = document.querySelector(
  ".home-page .current-image img"
);
const battlePageCurrentImage = document.querySelector(
  ".battle-page .current-image img"
);
const homePageExtractedImages = document.querySelector(
  ".home-page .extracted-images"
);
const battlePageExtractedImages = document.querySelector(
  ".battle-page .extracted-images"
);

const homePageDrawButton = document.querySelector(".home-page-draw-button");
const battlePageDrawButton = document.querySelector(".battle-page-draw-button");
const homePageResetButton = document.querySelector(".home-page-reset-button");
const battlePageResetButton = document.querySelector(
  ".battle-page-reset-button"
);
const finalMessage = document.querySelector(".extracted-images-title"); // seleziona l'elemento per il messaggio finale
const imgFolderUrl = "./img/"; // definisci l'URL della cartella img
let allImages = []; // definisci l'array per tutte le immagini disponibili
let imageIndex = 1; // si parte dall'immagine 1
let extracted = JSON.parse(localStorage.getItem("extracted")) || [];
const homePage = document.querySelector(".home-page");
const battlePage = document.querySelector(".battle-page");
const goToBattleImage = document.querySelector(".home-page .index-link");
const goToIndexImage = document.querySelector(".battle-page .index-link");

goToBattleImage.addEventListener("click", () => {
  homePage.style.display = "none";
  battlePage.style.display = "block";
  document.body.classList.remove("home-page-1");
  document.body.classList.add("battle-page-1");
});

goToIndexImage.addEventListener("click", () => {
  homePage.style.display = "block";
  battlePage.style.display = "none";
  document.body.classList.remove("battle-page-1");
  document.body.classList.add("home-page-1");
});

function fetchNextImage() {
  const imageUrl = `${imgFolderUrl}img_${imageIndex}.png`;
  fetch(imageUrl)
    .then((response) => {
      if (response.status === 404) {
        throw new Error("Image not found");
      }
      return response.blob();
    })
    .then(() => {
      allImages.push(imageUrl);
      imageIndex++;
      fetchNextImage();
    })
    .catch((error) => {
      if (error.message !== "Image not found") {
        console.error("An error occurred:", error);
      } else {
        // Abilita il pulsante "Estrai" dopo aver caricato tutte le immagini
        if (allImages.length > 0) {
          homePageDrawButton.disabled = false;
          battlePageDrawButton.disabled = false;
        }
      }
    });
}
fetchNextImage();

function addExtractedImage(imgUrl, extractedImages) {
  const div = document.createElement("div"); // crea un nuovo elemento <div>
  const img = document.createElement("img"); // crea un nuovo elemento <img>
  img.setAttribute("src", imgUrl); // imposta l'attributo src dell'elemento <img> con l'URL dell'immagine
  div.appendChild(img); // aggiunge l'elemento <img> come figlio dell'elemento <div>

  // aggiunge l'elemento <div> come primo figlio dell'elemento extractedImages
  if (extractedImages.firstChild) {
    extractedImages.insertBefore(div, extractedImages.firstChild);
  } else {
    extractedImages.appendChild(div);
  }
}

// Funzione per gestire l'estrazione delle immagini
function handleDraw(button, currentImage, extractedImages) {
  if (extracted.length === allImages.length) {
    finalMessage.textContent = "Tutti gli ingredienti sono stati estratti!";
    return;
  }

  let randomImage = allImages[Math.floor(Math.random() * allImages.length)];
  while (extracted.includes(randomImage)) {
    randomImage = allImages[Math.floor(Math.random() * allImages.length)];
  }

  // aggiungi l'immagine estratta all'array extracted
  extracted.push(randomImage);

  // salva l'array extracted in localStorage
  localStorage.setItem("extracted", JSON.stringify(extracted));

  // aggiungi l'immagine estratta alla sezione delle immagini estratte
  addExtractedImage(randomImage, extractedImages);

  // mostra l'immagine più recente in alto al centro
  currentImage.setAttribute("src", randomImage);
}

// Aggiungi event listeners ai nuovi pulsanti "Estrai"
homePageDrawButton.addEventListener("click", () => {
  handleDraw(homePageDrawButton, homePageCurrentImage, homePageExtractedImages);
});

battlePageDrawButton.addEventListener("click", () => {
  handleDraw(
    battlePageDrawButton,
    battlePageCurrentImage,
    battlePageExtractedImages
  );
});

// Funzione per gestire il reset del gioco
function handleReset(button, currentImage, extractedImages) {
  const confirmation = confirm(
    "Sei sicuro di voler cancellare l'estrazione in corso?"
  );
  if (confirmation) {
    extracted = [];
    localStorage.removeItem("extracted");
    extractedImages.innerHTML = "";
    finalMessage.textContent = "Immagini Estratte";

    // Imposta nuovamente l'attributo "src" dell'immagine corrente con il percorso dell'immagine della mascotte
    currentImage.setAttribute("src", "/favicon/pizza.png");
  }
}

// Aggiungi event listeners ai nuovi pulsanti "Reset"
homePageResetButton.addEventListener("click", () => {
  handleReset(
    homePageResetButton,
    homePageCurrentImage,
    homePageExtractedImages
  );
});

battlePageResetButton.addEventListener("click", () => {
  handleReset(
    battlePageResetButton,
    battlePageCurrentImage,
    battlePageExtractedImages
  );
});

// allert per evitare aggiornamento pagina
window.addEventListener("beforeunload", (event) => {
  event.preventDefault();
  event.returnValue =
    "Sei sicuro di voler aggiornare la pagina? I progressi potrebbero andare persi.";
});
