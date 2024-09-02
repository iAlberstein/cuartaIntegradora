const socket = io(); 

// Escuchando los productos enviados por el servidor
socket.on("productos", (data) => {
    renderProductos(data);
});

// Función para renderizar los productos y manejar la búsqueda
const renderProductos = (productos) => {
    const contenedorProductos = document.getElementById("contenedorProductos");
    const searchInput = document.getElementById("search");

    const filtrarProductos = () => {
        const query = searchInput.value.toLowerCase();
        const productosFiltrados = productos.docs.filter(item => 
            item.title.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query)
        );
        mostrarProductos(productosFiltrados);
    };

    // Agrega el evento de búsqueda
    searchInput.addEventListener("input", filtrarProductos);

    // Muestra todos los productos inicialmente
    mostrarProductos(productos.docs);
};

// Función para mostrar los productos en el contenedor
const mostrarProductos = (productos) => {
    const contenedorProductos = document.getElementById("contenedorProductos");
    contenedorProductos.innerHTML = "";

    productos.forEach(item => {
        const cardrtp = document.createElement("div");
        cardrtp.classList.add("cardrtp");

        cardrtp.innerHTML = ` 
            <p>${item.title}</p>
            <p>$${item.price}</p>
            <button>Eliminar</button>
        `;

        contenedorProductos.appendChild(cardrtp);

        // Agrega el evento al botón de eliminar
        cardrtp.querySelector("button").addEventListener("click", () => {
            eliminarProducto(item._id);
        });
    });
};

// Función para eliminar un producto
const eliminarProducto = (id) => {
    socket.emit("eliminarProducto", id);
};

// Evento para agregar productos desde el formulario
document.getElementById("btnEnviar").addEventListener("click", () => {
    agregarProducto();
});

// Función para agregar un nuevo producto
const agregarProducto = () => {
    const producto = {
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        descriptionExpand: document.getElementById("descriptionExpand").value,
        price: document.getElementById("price").value,
        img: document.getElementById("img").value,
        code: document.getElementById("code").value,
        stock: document.getElementById("stock").value,
        category: document.getElementById("category").value,
        status: document.getElementById("status").value === "true",
    };

    socket.emit("agregarProducto", producto);
}
