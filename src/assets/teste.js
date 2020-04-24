let btn;

onload = function() {

  btn = document.getElementById("teste");
  btn.addEventListener("click", () => {
    console.log('click')
  });

};