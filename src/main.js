import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import errorIcon from '../src/img/octagon.svg';
import closeIcon from '../src/img/close.svg';
import axios from 'axios';

const refs = {
  form: document.querySelector('.form'),
  gallery: document.querySelector('.gallery'),
  loader: document.querySelector('.loader'),
  searchMore: document.querySelector('.search-more'),
};
let gallery = new SimpleLightbox('.gallery a');

let query = null;
let page = null;
const per_page = 15;

refs.form.addEventListener('submit', onFormSubmit);
refs.searchMore.addEventListener('click', onGetImageByPage);

async function onGetImageByPage(e) {
  e.preventDefault();
  page += 1;

  refs.loader.classList.remove('hidden');
  try {
    const data = await getImagesByType();
    if (data.totalHits === 0) {
      return showError(message);
    }
    const markup = galleryTemplate(data.hits);
    refs.gallery.insertAdjacentHTML('beforeend', markup);
    gallery.refresh();
    checkBtnStatus(data);
  } catch (error) {
    showError(error);
  }
  refs.loader.classList.add('hidden');
  smoothScroll();
}

async function onFormSubmit(e) {
  e.preventDefault();
  query = e.target.elements.search.value.trim();
  page = 1;

  refs.loader.classList.remove('hidden');
  refs.gallery.innerHTML = '';
  try {
    const data = await getImagesByType();
    if (data.totalHits === 0) {
      refs.loader.classList.add('hidden');
      refs.searchMore.classList.add('hidden');
      return showError(
        'Sorry, there are no images matching <br/> your search query. Please try again!'
      );
    }
    const markup = galleryTemplate(data.hits);
    refs.gallery.innerHTML = markup;
    gallery.refresh();
    checkBtnStatus(data);
  } catch (error) {
    showError(error);
  }
  refs.loader.classList.add('hidden');
  refs.form.reset();
}

async function getImagesByType() {
  const url = 'https://pixabay.com/api/';
  const response = await axios.get(url, {
    params: {
      key: '42141224-180b0a56c10fd436e302d680a',
      q: query,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      page: page,
      per_page: per_page,
    },
  });
  return response.data;
}

function imageTemplate(data) {
  return `<li class="gallery-card">
        <a href="${data.largeImageURL}"
          ><img
            class="gallery-image"
            src="${data.webformatURL}"
            alt="${data.tags}"
            title=""
          />
        </a>
        <div class="gallery-card-items">
          <p class="gallery-card-info">
            Likes
            <span class="gallery-card-data">${data.likes}</span>
          </p>

          <p class="gallery-card-info">
            Views
            <span class="gallery-card-data">${data.views}</span>
          </p>

          <p class="gallery-card-info">
            Comments
            <span class="gallery-card-data">${data.comments}</span>
          </p>

          <p class="gallery-card-info">
            Downloads
            <span class="gallery-card-data">${data.downloads}</span>
          </p>
        </div>
      </li>`;
}
function galleryTemplate(data) {
  return data.map(imageTemplate).join('');
}

function showError(message) {
  iziToast.error({
    message,
    position: 'topRight',
    messageColor: '#ffffff',
    messageSize: '16px',
    backgroundColor: '#ef4040',
    iconColor: '#ffffff',
    iconUrl: errorIcon,
    timeout: 5000,
    close: false,
    closeOnEscape: true,
    buttons: [
      [
        `<button type="button" style="background-color: transparent" ><img src=${closeIcon}></button>`,
        function (instance, toast) {
          instance.hide({ transitionOut: 'fadeOut' }, toast);
        },
      ],
    ],
  });
}
function checkBtnStatus(data) {
  const maxPage = Math.ceil(data.totalHits / per_page);
  const isLastPage = maxPage === page;
  if (isLastPage) {
    refs.searchMore.classList.add('hidden');
    showError("We're sorry, but you've reached the end of search results.");
  } else {
    refs.searchMore.classList.remove('hidden');
  }
}
function smoothScroll() {
  const card = refs.gallery.firstElementChild;
  const cardSize = card.getBoundingClientRect();
  scrollBy({
    behavior: 'smooth',
    top: cardSize.height * 2,
  });
}
