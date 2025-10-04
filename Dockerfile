
FROM python:3.13


WORKDIR /code


COPY ./app/api/requirements.txt /code/requirements.txt


RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt


COPY ./app/api /code/app


CMD ["fastapi", "run", "app/main.py", "--port", "80"]