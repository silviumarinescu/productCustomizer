import productViewer from "./productViewer";

const container = document.querySelector(".container");
const image = "/assets/model1_img0.jpg";
const product = "/assets/model1.gltf";

productViewer.init({ container, image, product });

document.querySelector("#image").addEventListener("change", async (e) => {
  await productViewer.setImage(`assets/model${e.target.value}_img0.jpg`);
});
