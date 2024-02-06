// Importa las funciones necesarias de los SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD2Pysgp_7IYKa8b3VN3wG55ly0saR8AMU",
  authDomain: "proyecto-bar-b79c8.firebaseapp.com",
  projectId: "proyecto-bar-b79c8",
  storageBucket: "proyecto-bar-b79c8.appspot.com",
  messagingSenderId: "629613959942",
  appId: "1:629613959942:web:5eee0d55059f6be32a9c87"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Firestore
const db = getFirestore(app);


let productosSeleccionados = {};

window.seleccionarProducto = function(nombre, precio, spanId) {
    const cantidad = productosSeleccionados[spanId]?.cantidad || 1;
    const presio = precio; // Puedes ajustar esto si es necesario

    const producto = {
        nombre: nombre,
        presio: presio,
        cantidad: cantidad,
        precioTotal: presio * cantidad,
        spanId: spanId // Añadir el spanId al objeto del producto
    };

    productosSeleccionados[spanId] = producto;

    console.log(producto);
  

}



window.eliminarProducto = function(spanId) {
    delete productosSeleccionados[spanId];
    mostrarProductos(); // Actualiza la vista después de la eliminación
}


window.incrementarCantidad = function(spanId) {
    const producto = productosSeleccionados[spanId];
    if (producto) {
        producto.cantidad += 1;
        producto.precioTotal = producto.presio * producto.cantidad;

        // Actualizar la cantidad visualizada
        const cantidadSpan = document.getElementById(spanId);
        cantidadSpan.textContent = producto.cantidad;

        console.log(producto);
    }
}

window.decrementarCantidad = function(spanId) {
    const producto = productosSeleccionados[spanId];
    if (producto && producto.cantidad > 1) {
        producto.cantidad -= 1;
        producto.precioTotal = producto.presio * producto.cantidad;

        // Actualizar la cantidad visualizada
        const cantidadSpan = document.getElementById(spanId);
        cantidadSpan.textContent = producto.cantidad;

        console.log(producto);
    }
}


document.addEventListener("DOMContentLoaded", function() {
    // Definir la función enviarPedido en el ámbito global
    window.enviarPedido = async function(numeroMesa) {
        try {
            // Calcular el precio total del pedido sumando los precios totales de cada producto
            const precioTotalPedido = Object.values(productosSeleccionados).reduce((total, producto) => {
                return total + producto.precioTotal;
            }, 0);

            // Crear una referencia a la colección 'pedidos'
            const pedidosCollection = collection(db, 'pedidos');

            // Crear un documento con los productos seleccionados, precio total, número de mesa y otros detalles
            const pedidoDoc = await addDoc(pedidosCollection, {
                productos: productosSeleccionados,
                precioTotal: precioTotalPedido,
                numeroMesa: numeroMesa,
                timestamp: new Date(),
                // Puedes agregar más campos según tus necesidades
            });

            console.log('Pedido enviado con ID:', pedidoDoc.id);

            // Limpiar productos seleccionados después de enviar el pedido
            productosSeleccionados = {};

            // Mostrar el precio total del pedido
            console.log('Precio Total del Pedido:', precioTotalPedido);

            // Mostrar mensaje de éxito con SweetAlert2
            Swal.fire({
                icon: 'success',
                title: '¡Tu pedido se realizó correctamente!',
                text: `En breve te lo traeremos a la mesa ${numeroMesa}`,
                timer: 3000,
                showConfirmButton: false
            })
            .then(() => {
                // Recargar la página después de 3 segundos
                location.reload();
            });

        } catch (error) {
            console.error('Error al enviar el pedido:', error);

            // Mostrar mensaje de error con SweetAlert2
            Swal.fire({
                icon: 'error',
                title: 'Error al enviar el pedido',
                text: 'Por favor, inténtalo de nuevo.',
            });
        }
    }
});


// Obtén todos los elementos con la clase "checkIcon"
const checkIcons = document.querySelectorAll(".checkIcon");

// Itera sobre cada elemento y asigna el evento
checkIcons.forEach(function(icon) {
    icon.addEventListener("click", function() {
        // Obtén el producto desde el atributo de datos
        const producto = icon.getAttribute("data-producto");
        console.log("Producto seleccionado:", producto);

        // Tu lógica para cambiar el color o hacer otras acciones aquí
        this.classList.toggle("active");
    });
});




window.mostrarProductos = function() {
    const modal = document.getElementById("modal");
    modal.style.display = "flex";
    const resultadoDiv = document.getElementById("resultado");
    resultadoDiv.innerHTML = ""; // Limpiar contenido previo

     // Crear y agregar el select para seleccionar el número de mesa
     const selectMesa = document.createElement("select");
     for (let i = 1; i <= 7; i++) {
         const option = document.createElement("option");
         option.value = i;
         option.text = `Mesa ${i}`;
         selectMesa.appendChild(option);
     }
     resultadoDiv.appendChild(selectMesa);

    Object.values(productosSeleccionados).forEach(producto => {
        const productoInfo = document.createElement("div");
        productoInfo.classList.add('muestra');

        // Agrega la información del producto
        productoInfo.innerHTML = `<h2>${producto.nombre}</h2> 
        <h3>Cantidad: ${producto.cantidad}</h3>
        <p>$ ${producto.presio}</p>`;

        // Agrega un botón para eliminar el producto
        const eliminarBoton = document.createElement("button");
        eliminarBoton.textContent = "Eliminar";
        eliminarBoton.onclick = function() {
            eliminarProducto(producto.spanId);
            mostrarProductos(); // Vuelve a mostrar la lista actualizada después de la eliminación
        };

        // Agrega el botón de eliminar al div del producto
        productoInfo.appendChild(eliminarBoton);

        // Agrega el div del producto al resultadoDiv
        resultadoDiv.appendChild(productoInfo);
    });

    // Agrega el botón para enviar el pedido
    const enviarPedidoBoton = document.createElement("button");
    enviarPedidoBoton.textContent = "Enviar Pedido";
    enviarPedidoBoton.onclick = function() {
        // Obtener el número de mesa seleccionado
        const numeroMesa = selectMesa.value;

        if (numeroMesa === "") {
            alert("Por favor, selecciona un número de mesa antes de enviar el pedido.");
            return;
        }

        enviarPedido(numeroMesa);
        cerrarModal(); // Cierra el modal después de enviar el pedido
    };

    // Agrega el botón de enviar pedido al modal
    resultadoDiv.appendChild(enviarPedidoBoton);

    function cerrarModal() {
        const modal = document.getElementById("modal");
        modal.style.display = "none"; // Oculta el modal
    }
    
    function detenerPropagacion(event) {
        event.stopPropagation(); // Detiene la propagación del clic dentro del modal
    }
};





  






