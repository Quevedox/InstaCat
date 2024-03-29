document.addEventListener('DOMContentLoaded', function() {
    const storedImages = JSON.parse(localStorage.getItem('galleryImages')) || [];
    const gallery = document.getElementById('gallery');

    function displayStoredImages() {
        storedImages.forEach(function(imageData) {
            const img = createImageElement(imageData);
            gallery.appendChild(img);
        });
    }

    function createImageElement(imageData) {
        const img = document.createElement('img');
        img.src = imageData;
        const imgContainer = document.createElement('div');
        imgContainer.classList.add('img-container');
        const deleteBtn = createDeleteButton(imgContainer, imageData);
        imgContainer.appendChild(img);
        imgContainer.appendChild(deleteBtn);
        return imgContainer;
    }

    function createDeleteButton(imgContainer, imageData) {
        const deleteBtn = document.createElement('i');
        deleteBtn.classList.add('fas', 'fa-trash-alt', 'delete-btn');
        deleteBtn.addEventListener('click', function() {
            const index = storedImages.indexOf(imageData);
            storedImages.splice(index, 1);
            localStorage.setItem('galleryImages', JSON.stringify(storedImages));
            gallery.removeChild(imgContainer);
        });
        return deleteBtn;
    }

    displayStoredImages();

    document.getElementById('fileInput').addEventListener('change', function(event) {
        const files = event.target.files;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();

            reader.onload = async function() {
                const imgData = reader.result;
                const isCat = await detectCat(imgData);
                if (isCat) {
                    storedImages.push(imgData);
                    localStorage.setItem('galleryImages', JSON.stringify(storedImages));
                    const img = createImageElement(imgData);
                    gallery.appendChild(img);
                } else {
                    alert('La imagen no contiene un gato. Intente con otra imagen.');
                }
            };

            reader.readAsDataURL(file);
        }
    });

    async function detectCat(imageData) {
        const apiKey = '9b221febd85f4ea28c9893b70309e1c6'; // Reemplaza con tu API Key de Clarifai
        const modelId = 'aaa03c23b3724a16a56b629203edc62c'; // ID del modelo de detección de objetos generales (incluyendo gatos)

        try {
            const response = await axios.post('https://api.clarifai.com/v2/models/' + modelId + '/outputs', {
                inputs: [{ data: { image: { base64: imageData.split(',')[1] } } }]
            }, {
                headers: {
                    'Authorization': 'Key ' + apiKey,
                    'Content-Type': 'application/json'
                }
            });

            const concepts = response.data.outputs[0].data.concepts;
            const catConcept = concepts.find(concept => concept.name === 'cat');

            if (catConcept && catConcept.value >= 0.7) {
                return true; // Si la probabilidad de ser un gato es mayor o igual a 0.7, consideramos que la imagen contiene un gato
            } else {
                return false;
            }
        } catch (error) {
            console.error('Error al detectar el gato:', error);
            return false;
        }
    }
});
