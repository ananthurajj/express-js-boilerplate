COMPOSE_FILE_local=./deployments/local/docker-compose-local.yaml

BASE_PATH=$(PWD)

NAME_local=express-check-local

all:
	@echo
	@echo "please specifiy the command 😭"
	@echo

encrypt-env:
	@echo
	@echo "🗝️ Encrypt secrets in $(stage)"
	@echo
	@chmod +x ./scripts/encrypt-env.sh
	@./scripts/encrypt-env.sh "$(PWD)" "$(PASSPHRASE_$(stage))" "$(stage)"

decrypt-env:
	@echo
	@echo "🚀Decrypt secrets $(stage)"
	@echo
	@chmod +x ./scripts/decrypt-env.sh
	@./scripts/decrypt-env.sh "$(PWD)" "$(PASSPHRASE_$(stage))" "$(stage)"

move-env:
	@echo
	@echo "🚀Moving secrets of $(stage) to .env.local"
	@echo
	@chmod +x ./scripts/move-env.sh
	@./scripts/move-env.sh "$(PWD)" "$(stage)"

delete:
	@echo
	@echo "🗑️ Deleting $(stage) services"
	@echo
ifneq (,$(findstring i, $(MAKEFLAGS)))
	@COMPOSE_DOCKER_CLI_BUILD=1 BASE_PATH=$(BASE_PATH) docker-compose -f $(COMPOSE_FILE_$(stage)) -p $(NAME_$(stage)) down -v
else
	@COMPOSE_DOCKER_CLI_BUILD=1 BASE_PATH=$(BASE_PATH) docker-compose -f $(COMPOSE_FILE_$(stage)) -p $(NAME_$(stage)) down
endif

build-deploy:
	@echo
	@echo "🏭 ➡️ 💻 Building & Deploying $(stage) services"
	@echo
	@COMPOSE_DOCKER_CLI_BUILD=1 BASE_PATH=$(BASE_PATH) docker-compose -f $(COMPOSE_FILE_$(stage)) -p $(NAME_$(stage)) up -d --build

recreate:
	@$(MAKE) --no-print-directory delete -i
	@$(MAKE) --no-print-directory build-deploy
	@$(MAKE) --no-print-directory decrypt-env stage=$(stage)
ifneq ($(stage),local)
	@$(MAKE) --no-print-directory move-env stage=$(stage)
else
	@echo "Creating a S3 bucket"
	@aws --endpoint=$(AWS_ENDPOINT) s3api create-bucket --bucket express-check-bucket
endif
	@echo "Creating necessary SQS queues"
	@aws --endpoint=$(AWS_ENDPOINT) sqs create-queue --queue-name testQueue