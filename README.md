# 📑 Collaborative AI Flashcard Generator
This flashcard generator was developed as a project during the course AI Excellence with Creative Prompting Techniques (DLMPAIECPT01) at [IU](https://iu.de).

The application extracts PDF content and splits it into blocks. The user is then guided through the parsed content, allowing them to actively collaborate in refining and editing the material to create personalized flashcards. 
The goal of this project is to enable students to create personalized flashcards efficiently. The final product should yield flashcards that are tailored to ones own level of understanding while reducing overhead during the flashcard creation. 

The local setup allows to experiment with either the [HuggingFace Inference](https://huggingface.co/docs/api-inference/index) backend or the [OpenAI API](https://openai.com/api/) and any models available on those.

A public version is hosted at [flashcards.alexandermenze.de](https://flashcards.alexandermenze.de).

# 🛠️ Tooling

## Frontend
The frontend is developed using the following tools and libraries:
- [Vite.js](https://vitejs.dev/) for the web development environment
- [React](https://react.dev/) for building the interface using **TypeScript**
- [shadcn/ui](https://ui.shadcn.com/) for premade react components

### Development

> [!NOTE]  
> Make sure the backend url is configured properly in the respective .env.(development|production) file!

The frontend can be started locally using
```
npm run dev
```

or built for production using
```
npm run build
```

## Backend
The backend is developed using the following tools and libraries:
- [Azure Functions](https://learn.microsoft.com/en-us/azure/azure-functions/functions-overview?pivots=programming-language-python) as environment for the backend running **Python** code
- [PyMuPDF](https://pypi.org/project/PyMuPDF/) for extraction of content from PDF files
- [HuggingFace Inference](https://huggingface.co/docs/api-inference/index) as an easy to use and affordable AI service
- [OpenAI API](https://openai.com/api/) as an alternative, commercial and more expensive AI service

For default settings and options on the service and model used see [function_app.py](backend/functions_project/function_app.py)

### Development

The backend was developed specifically to be hosted on Azure. This resulted in a dependency on the Azure Functions development tools being installed. 
You can follow this [Code and test Azure Functions locally](https://learn.microsoft.com/en-us/azure/azure-functions/functions-develop-local) and this guide [Quickstart: Create a function in Azure with Python using Visual Studio Code](https://learn.microsoft.com/en-us/azure/azure-functions/create-first-function-vs-code-python) for any setup instructions.

Your local.settings.json should look like this:
```
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "python",
    "AzureWebJobsFeatureFlags": "EnableWorkerIndexing",
    "HUGGINGFACE_TOKEN": "<HuggingFace token if used>",
    "OPENAI_API_KEY": "<OpenAI token if used>"
  },
  "Host": {
    "CORS": "*"
  }
}
```

The local function emulator can be started through the Azure toolkit.

# License

The project is licensed under the AGPL license: [LICENSE](LICENSE)
