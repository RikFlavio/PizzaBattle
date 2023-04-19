// Crea una costante (valore immutabile) per l'URL della cartella delle immagini
const imgFolderUrl = "./img/";

// Crea una costante per l'URL della cartella delle immagini di battaglia
const imgBattleFolderUrl = "./img_battle/";

// Crea una costante per la chiave che rappresenta le immagini estratte dalla pagina principale
const extractedHomeKey = "extractedHome";

// Crea una costante per la chiave che rappresenta le immagini estratte dalla pagina di battaglia
const extractedBattleKey = "extractedBattle";

// Crea un array vuoto per memorizzare tutte le immagini
const allImages = [];

// Crea un array vuoto per memorizzare tutte le immagini di battaglia
const allBattleImages = [];

// Ottieni le immagini estratte dalla pagina principale dal localStorage,
// e se non ci sono dati, inizializza un array vuoto
let extractedHome = JSON.parse(localStorage.getItem(extractedHomeKey)) || [];

// Ottieni le immagini estratte dalla pagina di battaglia dal localStorage,
// e se non ci sono dati, inizializza un array vuoto
let extractedBattle =
  JSON.parse(localStorage.getItem(extractedBattleKey)) || [];

const selectors = {
  // Selettore per gli elementi della pagina home (oggetti annidati che contengono i selettori CSS per gli elementi HTML della pagina home e della pagina battle. )
  home: {
    page: ".home-page", // Selettore per l'elemento principale della pagina home
    currentImage: ".home-page .current-image img", // Selettore per l'immagine corrente nella pagina home
    extractedImages: ".home-page .extracted-images", // Selettore per le immagini estratte nella pagina home
    drawButton: ".home-page-draw-button", // Selettore per il pulsante "draw" nella pagina home
    resetButton: ".home-page-reset-button", // Selettore per il pulsante "reset" nella pagina home
    finalMessage: ".home-page .extracted-images-title", // Selettore per il messaggio finale nella pagina home
    bodyClass: "home-page-1", // Classe aggiunta al body quando la pagina home è attiva
  },
  // Selettore per gli elementi della pagina battle
  battle: {
    page: ".battle-page", // Selettore per l'elemento principale della pagina battle
    currentImage: ".battle-page .current-image img", // Selettore per l'immagine corrente nella pagina battle
    extractedImages: ".battle-page .extracted-images", // Selettore per le immagini estratte nella pagina battle
    drawButton: ".battle-page-draw-button", // Selettore per il pulsante "draw" nella pagina battle
    resetButton: ".battle-page-reset-button", // Selettore per il pulsante "reset" nella pagina battle
    finalMessage: ".battle-page .extracted-images-title", // Selettore per il messaggio finale nella pagina battle
    bodyClass: "battle-page-1", // Classe aggiunta al body quando la pagina battle è attiva
  },
};

// Definisci un oggetto chiamato "elements" con due proprietà: "home" e "battle"
const elements = {
  // La proprietà "home" è un oggetto vuoto che può essere utilizzato per memorizzare gli elementi della pagina home
  home: {},

  // La proprietà "battle" è un oggetto vuoto che può essere utilizzato per memorizzare gli elementi della pagina battle
  battle: {},
};

// Per ogni chiave nell'oggetto "selectors" (in questo caso, 'home' e 'battle')
Object.keys(selectors).forEach((page) => {
  // Per ogni chiave all'interno dell'oggetto corrispondente (ad esempio, 'page', 'currentImage', ecc.)
  Object.keys(selectors[page]).forEach((key) => {
    // Seleziona l'elemento HTML corrispondente al selettore CSS
    // e memorizzalo nell'oggetto "elements" nella posizione corrispondente
    elements[page][key] = document.querySelector(selectors[page][key]);
  });
});
// non essendo presenti nel ciclo sopra devi aggiungere i due elementi
elements.home.goToBattleImage = document.querySelector(
  ".home-page .index-link"
);
elements.battle.goToIndexImage = document.querySelector(
  ".battle-page .index-link"
);

elements.home.goToBattleImage.addEventListener("click", () => {
  switchPage("home", "battle");
});

elements.battle.goToIndexImage.addEventListener("click", () => {
  switchPage("battle", "home");
});

function switchPage(fromPage, toPage) {
  elements[fromPage].page.style.display = "none";
  elements[toPage].page.style.display = "block";
  document.body.classList.remove(selectors[fromPage].bodyClass);
  document.body.classList.add(selectors[toPage].bodyClass);

  // Salva la pagina corrente in localStorage
  localStorage.setItem("currentPage", toPage);
}
function restoreAppState() {
  // Carica la pagina corrente dal localStorage
  const currentPage = localStorage.getItem("currentPage");

  // Se la pagina corrente è stata salvata, ripristina la visualizzazione corretta
  if (currentPage) {
    switchPage(currentPage === "home" ? "battle" : "home", currentPage);
  }
}

function addExtractedImage(imageUrl, container) {
  const imageElement = document.createElement("img");
  imageElement.src = imageUrl;
  container.appendChild(imageElement);
}

function fetchImages(url, imagesArray, callback) {
  function fetchNextImage(imageIndex) {
    const imageUrl = `${url}img_${imageIndex}.png`;
    fetch(imageUrl)
      .then((response) => {
        if (response.status === 404) {
          throw new Error("Image not found");
        }
        return response.blob();
      })
      .then(() => {
        imagesArray.push(imageUrl);
        fetchNextImage(imageIndex + 1);
      })
      .catch((error) => {
        if (error.message !== "Image not found") {
          console.error("An error occurred:", error);
        } else {
          if (imagesArray.length > 0) {
            callback();
          }
        }
      });
  }
  fetchNextImage(1);
}

fetchImages(imgFolderUrl, allImages, () => {
  elements.home.drawButton.disabled = false;
  fetchImages(imgBattleFolderUrl, allBattleImages, () => {
    elements.battle.drawButton.disabled = false;
  });
});

elements.home.drawButton.addEventListener("click", () => {
  handleDraw("home");
});

elements.battle.drawButton.addEventListener("click", () => {
  handleDraw("battle");
});

elements.home.resetButton.addEventListener("click", () => {
  handleReset("home");
});

elements.battle.resetButton.addEventListener("click", () => {
  handleReset("battle");
});

window.addEventListener("beforeunload", (event) => {
  event.preventDefault();
  event.returnValue =
    "Sei sicuro di voler aggiornare la pagina? I progressi potrebbero andare persi.";
});

function handleDraw(page) {
  const imagesArray = page === "home" ? allImages : allBattleImages;
  const extracted = page === "home" ? extractedHome : extractedBattle;
  const extractedKey = page === "home" ? extractedHomeKey : extractedBattleKey;

  if (extracted.length === imagesArray.length) {
    elements[page].finalMessage.textContent =
      "Tutti gli ingredienti sono stati estratti!";
    return;
  }

  let randomImage = imagesArray[Math.floor(Math.random() * imagesArray.length)];
  while (extracted.includes(randomImage)) {
    randomImage = imagesArray[Math.floor(Math.random() * imagesArray.length)];
  }

  extracted.push(randomImage);
  localStorage.setItem(extractedKey, JSON.stringify(extracted));

  addExtractedImage(randomImage, elements[page].extractedImages);
  elements[page].currentImage.setAttribute("src", randomImage);
}

function handleReset(page) {
  const extracted = page === "home" ? extractedHome : extractedBattle;
  const extractedKey = page === "home" ? extractedHomeKey : extractedBattleKey;
  const confirmation = confirm(
    "Sei sicuro di voler cancellare l'estrazione in corso?"
  );
  if (confirmation) {
    const extracted = page === "home" ? extractedHome : extractedBattle;
    extracted.length = 0;
    localStorage.removeItem(extractedKey);

    elements[page].extractedImages.innerHTML = "";
    elements[page].finalMessage.textContent = "Immagini Estratte";
    elements[page].currentImage.setAttribute("src", "./favicon/pizza.png");
  }
}
restoreAppState();
