import './style.css'
import OpenAI from 'openai'

const loading = document.getElementById('loading')
const messageContainer = document.querySelector('.message-container')
const setup = document.getElementById('setup')
const language = document.getElementById('language')
const chat = document.getElementById('chat')

loading.style.display = 'none'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
})

const messages = [
  {
    role: 'system',
    content:
      'You are a translator that strictly translates English into another language. Only provide the translation in your response.',
  },
]

async function pingAi(text, language) {
  messages.push({
    role: 'user',
    content: `Translate the following: ${text} into ${language}`,
  })
  try {
    console.log('try: ', messages)
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
    })
    const translation = response.choices[0].message.content
    messages.push({
      role: 'system',
      content: translation,
    })
    console.log('response is: ', translation)

    renderTypewriterText(translation)
  } catch (error) {
    console.log(error)
    showError(error)
  }
}

document.getElementById('language').addEventListener('submit', (e) => {
  const langChoices = document.getElementsByName('language')
  const translateTextInput = document.getElementById('translate-text')
  e.preventDefault()
  let selectedLanguage
  for (let i = 0; i < langChoices.length; i++) {
    langChoices[i].checked && (selectedLanguage = langChoices[i].id)
  }
  const textToTranslate = translateTextInput.value
  selectedLanguage =
    selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)
  console.log(selectedLanguage, textToTranslate)
  pingAi(textToTranslate, selectedLanguage)

  const newMessageBubble = document.createElement('div')
  newMessageBubble.classList.add('message', 'message-user')
  newMessageBubble.textContent = textToTranslate
  chat.append(newMessageBubble)
  messageContainer.scrollTop = messageContainer.scrollHeight

  translateTextInput.value = ''
})

function renderTypewriterText(text) {
  const newMessageBubble = document.createElement('div')
  newMessageBubble.classList.add('message', 'message-bot', 'blinking-cursor')
  chat.appendChild(newMessageBubble)
  let i = 0
  const interval = setInterval(() => {
    newMessageBubble.textContent += text.slice(i - 1, i)
    if (text.length === i) {
      clearInterval(interval)
      newMessageBubble.classList.remove('blinking-cursor')
    }
    i++
    messageContainer.scrollTop = messageContainer.scrollHeight
  }, 50)
}

const showError = (error) => {
  messageContainer.classList.toggle('min')
  language.style.display = 'none'
  setup.style.display = 'none'

  loading.style.display = 'block'
  loading.innerHTML = ''
  const p = document.createElement('p')
  p.textContent = error
  const closeBtn = document.createElement('div')
  closeBtn.classList.add('close-btn')
  closeBtn.id = 'close'
  closeBtn.innerText = 'Close'
  closeBtn.addEventListener('click', () => {
    messageContainer.classList.toggle('min')
    setup.style.display = 'block'
    loading.style.display = 'none'
    setTimeout(() => {
      language.style.display = 'block'
    }, 500)
  })
  loading.append(p)
  loading.append(closeBtn)
}
