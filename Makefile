.PHONY: install backend-install frontend-install dev backend-dev frontend-dev build start stop clean test

install: backend-install frontend-install

backend-install:
	cd backend && npm install

frontend-install:
	cd frontend && npm install

dev:
	docker-compose up

backend-dev:
	cd backend && npm run dev

frontend-dev:
	cd frontend && npm run dev

build:
	docker-compose build

start:
	docker-compose up -d

stop:
	docker-compose down

clean:
	docker-compose down -v
	docker system prune -f

test:
	cd backend && npm test


