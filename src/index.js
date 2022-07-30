import productViewer from "./productViewer";

const container = document.querySelector(".container");

const image = `model1_img0.jpg`;
const product = `model1.gltf`;

productViewer.init({ container, image, product });

document.querySelector("#image").addEventListener("change", async (e) => {
  await productViewer.setImage(`model${e.target.value}_img0.jpg`);
});

document.querySelector("#model").addEventListener("change", async (e) => {
  await productViewer.setModel(`model${e.target.value}.gltf`);
});

const getFile = (file) =>
  new Promise((a) => {
    let reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = () => {
      a(reader.result);
    };
  });

document
  .querySelector("#custom-image")
  .addEventListener("change", async (e) => {
    const file = await getFile(e.target.files[0]);

    await productViewer.setImage(file);
  });
