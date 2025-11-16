# FAST API Microservice for UI5 Variant Maintenance

## About the Project

This is a demonstration of UI5 Freestyle Screen View with Variant Management handled via Python FASTAPI backend .

The logic to manage & store variant's in DB are implemented as a Python microservice , and designed to be useable by multiple object .

The UI5 is built as a quick example to demonstrate the backend functionality , complete with create, read, save, saveas, delete, rename, reload functionality .

### Built With

* Python
* FAST API
* Pydantic
* TinyDB
* Javascript
* UI5

![alt text](variant_management_app.png)

## Getting Started
Follow the prerequisites to initialize and run the project locally .

Clone the repository , open the root folder in your terminal or code editor . 
You will need two instance of terminal to :-
  * To run the Python FAST API instance .
  * To run the UI5 frotend instance .

### Prerequisites
Please ensure Python , PIP , Nodejs & NPM are installed in your system .

### Initialization - Python

* Create you Python Virtual Environment in the root folder .

  ~~~
  python -m venv pyenv
  ~~~

* activate env
  
  ~~~
  source pyenv/bin/activate.fish
  ~~~

  Please Note: using *.fish , since it's the preferred shell for my linux environment .

* install required python packages

  ~~~
  pip install -r ./server/requirements.txt
  ~~~

* run server
  ~~~
  uvicorn main:app --reload
  ~~~

### Initialization - UI5

* cd into the UI5 folder from root

  ~~~
  cd ./app/zapp
  ~~~

* install npm packages
  
  ~~~
  npm i
  ~~~

* run server
  ~~~
  npm run start
  ~~~

## Notes

* FAST API 
  FAST API comes with inbuilt UI for open API .
  Please ensure that the open API docs are only exposed in the Development environments .

![alt text](openAPI.png)

* TINY DB

    TinyDB is a serverless nosql database with simple API , allowing document store . 
This is stuiable for low traffic project where most of user actions are read .

    For scalabilty, concurrency & advanced features , please use Redis or Valkey . esp. in case of high write traffic .

    The data is stored in variant.json file under two db: header & data .


## License

The code is licensed under MIT . Please refere to the LICENSE file .