# superhack



## Introduction

Prototype Divided into smaller modules 
1. client - React webapp
2. kb - Knowledge base crawler
3. llm - LLM engine based on ollama
4. MCP - Master KB interfacing MCP server
5. server - Expressjs Application server

## Client

Pre-requisites 
1. Nodejs v18 and above

To start 

```
cd client
npm install
npm start
```

## Knowledge Base Crawler
Pre-requisites 
1. python 3.10 or above
2. mongodb 4.2 or above


To start 

```
cd kb
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python main.py
npm start
```

## LLM Engine

Pre-requisites 
1. Nodejs v18 and above

To start 

```
cd llm
npm install
npm start
```


## MCP server
Pre-requisites 
1. python 3.10 or above
2. mongodb 4.2 or above


To start 

```
cd mcp
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python main.py
npm start
```


## Application Server

Pre-requisites 
1. Nodejs v18 and above

To start 

```
cd server
npm install
npm start
```

