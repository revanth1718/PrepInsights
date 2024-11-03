import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Quote from '@editorjs/quote';
import Embed from '@editorjs/embed';
import InlineCode from '@editorjs/inline-code';
import Image from '@editorjs/image';
import Marker from '@editorjs/marker';
import axios from 'axios';

const handleBannerUpload = async (e) => {
  const files = e.target.files;
  const formData = new FormData();

  for (let i = 0; i < files.length; i++) {
    formData.append('images', files[i]);
  }

  try {
    const { data } = await axios.post(
      import.meta.env.VITE_SERVER_DOMAIN + '/upload1',
      formData,
      {
        headers: { 'Content-type': 'multipart/form-data' },
      }
    );
    const img = data.map((i) => ({
      public_id: i.public_id,
      url: i.url,
    }));

    return img;
  } catch (err) {
    alert(err);
  }
};

const handleUpload = async (e) => {
  const imageUrls = await handleBannerUpload(e);

  if (imageUrls && imageUrls.length > 0) {
    console.log(imageUrls);
  } else {
    console.log('no url');
  }
};

const uploadImageByURL = (url) => {
  return new Promise((resolve, reject) => {
    if (url) {
      resolve({
        success: 1,
        file: { url },
      });
    } else {
      reject(new Error("Invalid URL"));
    }
  });
};

// Define `uploadImageByFile` for handling file uploads via Editor.js
const uploadImageByFile = async (file) => {
  const formData = new FormData();
  formData.append('images', file);

  try {
    const { data } = await axios.post(
      import.meta.env.VITE_SERVER_DOMAIN + '/upload1',
      formData,
      {
        headers: { 'Content-type': 'multipart/form-data' },
      }
    );
    return {
      success: 1,
      file: { url: data[0].url },
    };
  } catch (err) {
    return { success: 0, message: err.message };
  }
};

export const tools = {
  embed: Embed,
  list: {
    class: List,
    inlineToolbar: true,
  },
  image: {
    class: Image,
    config: {
      uploader: {
        uploadByUrl: uploadImageByURL,
        uploadByFile: uploadImageByFile,
      },
    },
  },
  header: {
    class: Header,
    config: {
      placeholder: 'Type Heading...',
      levels: [2, 3, 4],
      defaultLevel: 2,
    },
  },
  quote: {
    class: Quote,
    inlineToolbar: true,
  },
  marker: Marker,
  inlineCode: InlineCode,
};
