const inputRef = document.getElementById("input");
const playerRef = document.getElementById("player");
const gridRef = document.getElementById("grid");
let animationId = null;
let isPlaing = false;

for (let i = 0; i < 36; i += 1) {
  const gridItem = document.createElement("div");
  gridItem.classList.add("grid-item");
  gridRef.appendChild(gridItem);
}

inputRef.addEventListener("change", handleSelectAudio);

function handleSelectAudio(e) {
  const fileList = e.target.files;

  if (fileList && fileList.length > 0) {
    const file = fileList[0];
    const newReader = new FileReader();
    newReader.onload = (e) => {
      playerRef.src = e.target.result;
      playerRef.style.display = "block";
      playerRef.play();
      isPlaing = true;
      render();
    };

    newReader.readAsDataURL(file);
  }
}

function render() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  const equalizer = audioContext.createAnalyser();
  const audioSource = audioContext.createMediaElementSource(playerRef);

  audioSource.connect(equalizer);
  equalizer.connect(audioContext.destination);

  equalizer.fftSize = 512;
  const bufferLength = equalizer.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  const gridItems = document.querySelectorAll(".grid-item");

  function drawTheGrid() {
    requestAnimationFrame(drawTheGrid);
    // if (!playerRef.paused) {
    //   animationId = requestAnimationFrame(drawTheGrid);
    //   console.log(!playerRef.paused);
    // } else {
    //   cancelAnimationFrame(animationId);
    //   animationId = null;
    //   console.log(!playerRef.paused);
    // }
    // console.log("Draw", animationId);

    equalizer.getByteFrequencyData(dataArray);

    gridItems.forEach((item, i) => {
      const currentValue = dataArray[i];

      let row = 5 - Math.floor(i / 6);
      if (row < 0) row = 0;

      const column = i % 6;
      const scaledValue = (currentValue * (row + 1)) / 1024;

      if (scaledValue > 0.1) {
        const color = `rgb(${Math.floor((1 - scaledValue) * 255)}, 46, 37)`;
        item.style.backgroundColor = color;
      } else {
        item.style.backgroundColor = "#fff";
      }

      item.style.gridRowStart = row + 1;
      item.style.gridColumnStart = column + 1;
    });
  }

  drawTheGrid();
}
