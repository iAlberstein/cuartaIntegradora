//Creamos una instancia de socket.io del lado del cliente ahora: 
const socket = io(); 

//Creamos una variable para guardar el usuario: 

document.getElementById("btnEnviar").addEventListener("click", () => {
    agregarProducto();
})

const agregarProducto = () => {
    const producto = {
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        price: document.getElementById("price").value,
        img: document.getElementById("img").value,
        code: document.getElementById("code").value,
        stock: document.getElementById("stock").value,
        category: document.getElementById("category").value,
        status: document.getElementById("status").value === "true"
    };
    socket.emit("agregarProducto", producto);
}

socket.on("productos", (data) => {
    renderProductos(data);
})

const renderProductos = (productos) => {
    contenedorProductos.innerHTML = "";

    productos.forEach(item => {
        const card = document.createElement("div");
        card.classList.add("elemento");
        card.innerHTML = `
                            <p class="elementortpid"> ID: ${item._id} </p>
                            <p class="elementortp"> Titulo:  ${item.title} </p>
                            <p class="elementortp"> Precio: ${item.price} </p>
                            <button> Eliminar producto </button>
                        `;
        contenedorProductos.appendChild(card);
    
        card.querySelector("button").addEventListener("click", () => {
            eliminarProducto(item._id)
        }) 
    })
}

const eliminarProducto = (id) => {
    socket.emit("eliminarProducto", id);
}
