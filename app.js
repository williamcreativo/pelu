const form = document.getElementById('formMascota');
const listaMascotas = document.getElementById('listaMascotas');

let mascotas = JSON.parse(localStorage.getItem('mascotas')) || [];

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const id = document.getElementById('id').value;
  const nombre = document.getElementById('nombre').value.trim();
  const edad = document.getElementById('edad').value;
  const tipo = document.getElementById('tipo').value;

  // Radio button
  const vacunado = document.querySelector('input[name="vacunado"]:checked')?.value;

  // Checkboxes
  const servicios = Array.from(document.querySelectorAll('input[name="servicios"]:checked'))
    .map(cb => cb.value);

  if (!nombre || !edad || !tipo || !vacunado) return;

  const imagen = await obtenerImagen(tipo);

  if (id) {
    const index = mascotas.findIndex(m => m.id === id);
    mascotas[index] = { id, nombre, edad, tipo, vacunado, servicios, imagen };
  } else {
    mascotas.push({
      id: crypto.randomUUID(),
      nombre,
      edad,
      tipo,
      vacunado,
      servicios,
      imagen
    });
  }

  localStorage.setItem('mascotas', JSON.stringify(mascotas));
  form.reset();
  document.getElementById('id').value = '';
  renderizarMascotas();
});

function renderizarMascotas() {
  listaMascotas.innerHTML = '';
  mascotas.forEach(mascota => {
    const vacunadoTexto = mascota.vacunado ? mascota.vacunado : 'No especificado';
    const serviciosTexto = mascota.servicios && mascota.servicios.length > 0
      ? mascota.servicios.join(', ')
      : 'Ninguno';

    const div = document.createElement('div');
    div.className = 'card-mascota';
    div.innerHTML = `
      <h3>${mascota.nombre}</h3>
      <p>Edad: ${mascota.edad}</p>
      <p>Tipo: ${mascota.tipo}</p>
      <p>¿Vacunado?: ${vacunadoTexto}</p>
      <p>Servicios: ${serviciosTexto}</p>
      <img src="${mascota.imagen}" alt="${mascota.tipo}">
      <button class="btn-editar" data-id="${mascota.id}">Editar</button>
      <button class="btn-eliminar" data-id="${mascota.id}">Eliminar</button>
    `;
    // listaMascotas.appendChild(div);
    listaMascotas.prepend(div);
  });
}

// Delegación de eventos para editar y eliminar
listaMascotas.addEventListener('click', (e) => {
  if (e.target.classList.contains('btn-editar')) {
    const id = e.target.getAttribute('data-id');
    const mascota = mascotas.find(m => m.id === id);
    if (mascota) {
      document.getElementById('id').value = mascota.id;
      document.getElementById('nombre').value = mascota.nombre;
      document.getElementById('edad').value = mascota.edad;
      document.getElementById('tipo').value = mascota.tipo;

      
      const radios = document.querySelectorAll('input[name="vacunado"]');
      radios.forEach(r => {
        r.checked = r.value === mascota.vacunado;
      });

      
      const checks = document.querySelectorAll('input[name="servicios"]');
      checks.forEach(c => {
        c.checked = mascota.servicios?.includes(c.value) || false;
      });

      if (window.innerWidth < 1280) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  if (e.target.classList.contains('btn-eliminar')) {
    const id = e.target.getAttribute('data-id');
    mascotas = mascotas.filter(m => m.id !== id);
    localStorage.setItem('mascotas', JSON.stringify(mascotas));
    renderizarMascotas();
    
  }
});

async function obtenerImagen(tipo) {
  const urls = {
    perro: 'https://api.thedogapi.com/v1/images/search',
    gato: 'https://api.thecatapi.com/v1/images/search'
  };

  try {
    const res = await fetch(urls[tipo]);
    const data = await res.json();
    return data[0].url;
  } catch (e) {
    console.error('Error al obtener imagen', e);
    return 'https://via.placeholder.com/300x200?text=Sin+Imagen';
  }
}

renderizarMascotas();
