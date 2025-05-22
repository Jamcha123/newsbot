#newsbot - generate funny satirical news headlines


newsbot generates news articles given a prompt or a lists news articles from https://www.dn.et

use newsbot to create a psyop on X/twitter or reddit or something

first install it

```
    npm i newsbot
```

second create a .env file (has to be AI_KEY)

```
    AI_KEY=<your OpenAI token>
```

third import it

```
    import newsbot from 'newsbot'
```

fourth initialize it

```
    const obj = news newsbot()
```

list of functions:

    1. generateHeadline({"headline": "C++ nation declares war on pythonea"})

    2. getHeadlines() // gets a list of headlines from https://www.dn.se, its in swedish but you can use google translate it
