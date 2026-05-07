import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ergonomia API',
      version: '1.0.0',
      description: 'API REST do sistema de Análise Ergonômica do Trabalho (AET/AEP)',
    },
    servers: [{ url: 'http://localhost:3001', description: 'Desenvolvimento' }],
    tags: [
      { name: 'Health', description: 'Status do servidor' },
      { name: 'Empresas', description: 'Gerenciamento de empresas' },
      { name: 'Unidades', description: 'Unidades das empresas' },
      { name: 'Setores', description: 'Setores das unidades' },
      { name: 'Cargos', description: 'Cargos padrão com EPIs e equipamentos' },
      { name: 'EPIs', description: 'Equipamentos de Proteção Individual' },
      { name: 'Equipamentos', description: 'Equipamentos padrão e operações' },
      { name: 'Perguntas Entrevista', description: 'Perguntas para entrevista ergonômica' },
      { name: 'Pausas', description: 'Pausas padrão' },
      { name: 'Turnos', description: 'Turnos de trabalho' },
      { name: 'Classificações de Risco', description: 'Classificações e pontuações de risco' },
      { name: 'Modelos de Texto', description: 'Modelos de texto para relatórios' },
      { name: 'Métodos Científicos', description: 'Modelos de métodos científicos com imagens' },
      { name: 'Perguntas Checklist', description: 'Perguntas de checklist' },
      { name: 'Fatores Biomecânicos', description: 'Fatores de risco biomecânico' },
      { name: 'Parâmetros Iluminância', description: 'Parâmetros normativos de iluminância' },
      { name: 'Projetos', description: 'Projetos AET/AEP (armazenamento JSONB)' },
      { name: 'Clientes', description: 'Clientes (armazenamento JSONB)' },
    ],
    components: {
      schemas: {
        Error: {
          type: 'object',
          properties: { error: { type: 'string' } },
        },
        Company: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            razaoSocial: { type: 'string' },
            nomeFantasia: { type: 'string' },
            cnpj: { type: 'string' },
            logradouro: { type: 'string' },
            numero: { type: 'string' },
            complemento: { type: 'string' },
            bairro: { type: 'string' },
            municipio: { type: 'string' },
            uf: { type: 'string', maxLength: 2 },
            cep: { type: 'string' },
            product: { type: 'string' },
            marketSituation: { type: 'string' },
            productionLocation: { type: 'string' },
            riskDegree: { type: 'string' },
            logoDataUrl: { type: 'string' },
            active: { type: 'boolean' },
          },
        },
        Unit: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            companyId: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            cep: { type: 'string' },
            logradouro: { type: 'string' },
            numero: { type: 'string' },
            complemento: { type: 'string' },
            bairro: { type: 'string' },
            city: { type: 'string' },
            uf: { type: 'string', maxLength: 2 },
            address: { type: 'string' },
            productionLocation: { type: 'string' },
            logoDataUrl: { type: 'string' },
          },
        },
        Sector: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            companyId: { type: 'string', format: 'uuid' },
            unitId: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            active: { type: 'boolean' },
          },
        },
        JobRole: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            companyId: { type: 'string', format: 'uuid' },
            sectorId: { type: 'string', format: 'uuid' },
            parentRoleId: { type: 'string', format: 'uuid', nullable: true },
            name: { type: 'string' },
            cbo: { type: 'string' },
            description: { type: 'string' },
            active: { type: 'boolean' },
            epiIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
            equipmentIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
          },
        },
        EPI: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            type: { type: 'string' },
            description: { type: 'string' },
            mandatoryByDefault: { type: 'boolean' },
            active: { type: 'boolean' },
          },
        },
        Equipment: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            category: { type: 'string' },
            description: { type: 'string' },
            hasDimensions: { type: 'boolean' },
            active: { type: 'boolean' },
            operation: { type: 'array', items: { type: 'string' } },
          },
        },
        SurveyQuestion: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            question: { type: 'string' },
            category: { type: 'string' },
            responseType: { type: 'string' },
            required: { type: 'boolean' },
            order: { type: 'integer' },
            active: { type: 'boolean' },
            options: { type: 'array', items: { type: 'string' } },
          },
        },
        Pause: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            duration: { type: 'string' },
            durationUnit: { type: 'string' },
            description: { type: 'string' },
            active: { type: 'boolean' },
          },
        },
        Shift: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            active: { type: 'boolean' },
          },
        },
        RiskClassification: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            minScore: { type: 'number' },
            maxScore: { type: 'number' },
            color: { type: 'string' },
            interpretation: { type: 'string' },
          },
        },
        ReportText: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            section: { type: 'string' },
            title: { type: 'string' },
            text: { type: 'string' },
            active: { type: 'boolean' },
          },
        },
        ScientificMethod: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            imageDataUrls: { type: 'array', items: { type: 'string' } },
          },
        },
        ChecklistQuestion: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            text: { type: 'string' },
            functionIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
          },
        },
        BiomechanicalFactor: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            active: { type: 'boolean' },
            biomechanicalFactors: { type: 'array', items: { type: 'string' } },
          },
        },
        IlluminanceParam: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            activityDescription: { type: 'string' },
            minimumLux: { type: 'number' },
            minimumIRC: { type: 'number' },
            tolerancePercent: { type: 'number' },
            maxUniformityRatio: { type: 'number' },
            normativeReference: { type: 'string' },
            pageReference: { type: 'string' },
          },
        },
        Project: {
          type: 'object',
          description: 'Projeto AET/AEP — estrutura arbitrária armazenada como JSONB',
          properties: {
            id: { type: 'string', format: 'uuid' },
            criadoEm: { type: 'string', format: 'date-time' },
            atualizadoEm: { type: 'string', format: 'date-time' },
          },
          additionalProperties: true,
        },
        Client: {
          type: 'object',
          description: 'Cliente — estrutura arbitrária armazenada como JSONB',
          properties: {
            id: { type: 'string', format: 'uuid' },
            companyName: { type: 'string' },
          },
          additionalProperties: true,
        },
      },
    },
    paths: {
      '/api/health': {
        get: {
          tags: ['Health'],
          summary: 'Verifica conectividade com o banco de dados',
          responses: {
            '200': {
              description: 'Servidor e banco operacionais',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'ok' },
                      db: { type: 'string', example: 'connected' },
                    },
                  },
                },
              },
            },
            '500': {
              description: 'Falha na conexão com o banco',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
            },
          },
        },
      },

      // ── Companies ──────────────────────────────────────────────────────────
      '/api/companies': {
        get: {
          tags: ['Empresas'],
          summary: 'Lista todas as empresas',
          responses: {
            '200': {
              description: 'Array de empresas ordenado por razão social',
              content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Company' } } } },
            },
          },
        },
        post: {
          tags: ['Empresas'],
          summary: 'Cria uma nova empresa',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Company' } } },
          },
          responses: {
            '201': { description: 'Empresa criada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Company' } } } },
            '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/companies/{id}': {
        put: {
          tags: ['Empresas'],
          summary: 'Atualiza uma empresa',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Company' } } } },
          responses: {
            '200': { description: 'Empresa atualizada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Company' } } } },
            '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        delete: {
          tags: ['Empresas'],
          summary: 'Remove uma empresa',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            '204': { description: 'Empresa removida' },
            '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },

      // ── Units ──────────────────────────────────────────────────────────────
      '/api/units': {
        get: {
          tags: ['Unidades'],
          summary: 'Lista todas as unidades',
          responses: { '200': { description: 'Array de unidades', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Unit' } } } } } },
        },
        post: {
          tags: ['Unidades'],
          summary: 'Cria uma nova unidade',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Unit' } } } },
          responses: {
            '201': { description: 'Unidade criada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Unit' } } } },
            '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/units/{id}': {
        put: {
          tags: ['Unidades'],
          summary: 'Atualiza uma unidade',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Unit' } } } },
          responses: {
            '200': { description: 'Unidade atualizada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Unit' } } } },
            '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        delete: {
          tags: ['Unidades'],
          summary: 'Remove uma unidade',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '204': { description: 'Unidade removida' }, '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } } },
        },
      },

      // ── Sectors ────────────────────────────────────────────────────────────
      '/api/sectors': {
        get: {
          tags: ['Setores'],
          summary: 'Lista todos os setores',
          responses: { '200': { description: 'Array de setores', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Sector' } } } } } },
        },
        post: {
          tags: ['Setores'],
          summary: 'Cria um novo setor',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Sector' } } } },
          responses: {
            '201': { description: 'Setor criado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Sector' } } } },
            '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/sectors/{id}': {
        put: {
          tags: ['Setores'],
          summary: 'Atualiza um setor',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Sector' } } } },
          responses: {
            '200': { description: 'Setor atualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Sector' } } } },
            '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        delete: {
          tags: ['Setores'],
          summary: 'Remove um setor',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '204': { description: 'Setor removido' }, '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } } },
        },
      },

      // ── Job Roles ──────────────────────────────────────────────────────────
      '/api/job-roles': {
        get: {
          tags: ['Cargos'],
          summary: 'Lista todos os cargos com EPIs e equipamentos associados',
          responses: { '200': { description: 'Array de cargos', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/JobRole' } } } } } },
        },
        post: {
          tags: ['Cargos'],
          summary: 'Cria um cargo e associa EPIs/equipamentos (transação)',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/JobRole' } } } },
          responses: {
            '201': { description: 'Cargo criado', content: { 'application/json': { schema: { $ref: '#/components/schemas/JobRole' } } } },
            '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/job-roles/{id}': {
        put: {
          tags: ['Cargos'],
          summary: 'Atualiza cargo e recarrega EPIs/equipamentos (transação)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/JobRole' } } } },
          responses: {
            '200': { description: 'Cargo atualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/JobRole' } } } },
            '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        delete: {
          tags: ['Cargos'],
          summary: 'Remove um cargo',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '204': { description: 'Cargo removido' }, '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } } },
        },
      },

      // ── EPIs ───────────────────────────────────────────────────────────────
      '/api/epis': {
        get: {
          tags: ['EPIs'],
          summary: 'Lista todos os EPIs',
          responses: { '200': { description: 'Array de EPIs', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/EPI' } } } } } },
        },
        post: {
          tags: ['EPIs'],
          summary: 'Cria um novo EPI',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/EPI' } } } },
          responses: {
            '201': { description: 'EPI criado', content: { 'application/json': { schema: { $ref: '#/components/schemas/EPI' } } } },
            '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/epis/{id}': {
        put: {
          tags: ['EPIs'],
          summary: 'Atualiza um EPI',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/EPI' } } } },
          responses: {
            '200': { description: 'EPI atualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/EPI' } } } },
            '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        delete: {
          tags: ['EPIs'],
          summary: 'Remove um EPI',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '204': { description: 'EPI removido' }, '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } } },
        },
      },

      // ── Equipment ──────────────────────────────────────────────────────────
      '/api/equipment': {
        get: {
          tags: ['Equipamentos'],
          summary: 'Lista todos os equipamentos com operações',
          responses: { '200': { description: 'Array de equipamentos', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Equipment' } } } } } },
        },
        post: {
          tags: ['Equipamentos'],
          summary: 'Cria equipamento com lista de operações (transação)',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Equipment' } } } },
          responses: {
            '201': { description: 'Equipamento criado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Equipment' } } } },
            '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/equipment/{id}': {
        put: {
          tags: ['Equipamentos'],
          summary: 'Atualiza equipamento e recarrega operações (transação)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Equipment' } } } },
          responses: {
            '200': { description: 'Equipamento atualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Equipment' } } } },
            '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        delete: {
          tags: ['Equipamentos'],
          summary: 'Remove um equipamento',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '204': { description: 'Equipamento removido' }, '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } } },
        },
      },

      // ── Survey Questions ───────────────────────────────────────────────────
      '/api/survey-questions': {
        get: {
          tags: ['Perguntas Entrevista'],
          summary: 'Lista todas as perguntas de entrevista (ordenadas por ordem)',
          responses: { '200': { description: 'Array de perguntas', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/SurveyQuestion' } } } } } },
        },
        post: {
          tags: ['Perguntas Entrevista'],
          summary: 'Cria pergunta com opções de resposta (transação)',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SurveyQuestion' } } } },
          responses: {
            '201': { description: 'Pergunta criada', content: { 'application/json': { schema: { $ref: '#/components/schemas/SurveyQuestion' } } } },
            '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/survey-questions/{id}': {
        put: {
          tags: ['Perguntas Entrevista'],
          summary: 'Atualiza pergunta e recarrega opções (transação)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SurveyQuestion' } } } },
          responses: {
            '200': { description: 'Pergunta atualizada', content: { 'application/json': { schema: { $ref: '#/components/schemas/SurveyQuestion' } } } },
            '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        delete: {
          tags: ['Perguntas Entrevista'],
          summary: 'Remove uma pergunta',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '204': { description: 'Pergunta removida' }, '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } } },
        },
      },

      // ── Pauses ─────────────────────────────────────────────────────────────
      '/api/pauses': {
        get: {
          tags: ['Pausas'],
          summary: 'Lista todas as pausas padrão',
          responses: { '200': { description: 'Array de pausas', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Pause' } } } } } },
        },
        post: {
          tags: ['Pausas'],
          summary: 'Cria uma nova pausa',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Pause' } } } },
          responses: {
            '201': { description: 'Pausa criada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Pause' } } } },
            '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/pauses/{id}': {
        put: {
          tags: ['Pausas'],
          summary: 'Atualiza uma pausa',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Pause' } } } },
          responses: {
            '200': { description: 'Pausa atualizada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Pause' } } } },
            '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        delete: {
          tags: ['Pausas'],
          summary: 'Remove uma pausa',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '204': { description: 'Pausa removida' }, '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } } },
        },
      },

      // ── Shifts ─────────────────────────────────────────────────────────────
      '/api/shifts': {
        get: {
          tags: ['Turnos'],
          summary: 'Lista todos os turnos',
          responses: { '200': { description: 'Array de turnos', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Shift' } } } } } },
        },
        post: {
          tags: ['Turnos'],
          summary: 'Cria um novo turno',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Shift' } } } },
          responses: {
            '201': { description: 'Turno criado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Shift' } } } },
            '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/shifts/{id}': {
        put: {
          tags: ['Turnos'],
          summary: 'Atualiza um turno',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Shift' } } } },
          responses: {
            '200': { description: 'Turno atualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Shift' } } } },
            '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        delete: {
          tags: ['Turnos'],
          summary: 'Remove um turno',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '204': { description: 'Turno removido' }, '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } } },
        },
      },

      // ── Risk Classifications ───────────────────────────────────────────────
      '/api/risk-classifications': {
        get: {
          tags: ['Classificações de Risco'],
          summary: 'Lista todas as classificações de risco (ordenadas por pontuação mínima)',
          responses: { '200': { description: 'Array de classificações', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/RiskClassification' } } } } } },
        },
        post: {
          tags: ['Classificações de Risco'],
          summary: 'Cria uma nova classificação de risco',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RiskClassification' } } } },
          responses: {
            '201': { description: 'Classificação criada', content: { 'application/json': { schema: { $ref: '#/components/schemas/RiskClassification' } } } },
            '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/risk-classifications/{id}': {
        put: {
          tags: ['Classificações de Risco'],
          summary: 'Atualiza uma classificação de risco',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RiskClassification' } } } },
          responses: {
            '200': { description: 'Classificação atualizada', content: { 'application/json': { schema: { $ref: '#/components/schemas/RiskClassification' } } } },
            '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        delete: {
          tags: ['Classificações de Risco'],
          summary: 'Remove uma classificação de risco',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '204': { description: 'Classificação removida' }, '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } } },
        },
      },

      // ── Report Texts ───────────────────────────────────────────────────────
      '/api/report-texts': {
        get: {
          tags: ['Modelos de Texto'],
          summary: 'Lista todos os modelos de texto (ordenados por seção e título)',
          responses: { '200': { description: 'Array de modelos', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/ReportText' } } } } } },
        },
        post: {
          tags: ['Modelos de Texto'],
          summary: 'Cria um novo modelo de texto',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ReportText' } } } },
          responses: {
            '201': { description: 'Modelo criado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ReportText' } } } },
            '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/report-texts/{id}': {
        put: {
          tags: ['Modelos de Texto'],
          summary: 'Atualiza um modelo de texto',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ReportText' } } } },
          responses: {
            '200': { description: 'Modelo atualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ReportText' } } } },
            '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        delete: {
          tags: ['Modelos de Texto'],
          summary: 'Remove um modelo de texto',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '204': { description: 'Modelo removido' }, '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } } },
        },
      },

      // ── Scientific Methods ─────────────────────────────────────────────────
      '/api/scientific-methods': {
        get: {
          tags: ['Métodos Científicos'],
          summary: 'Lista todos os modelos de método científico com imagens',
          responses: { '200': { description: 'Array de métodos', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/ScientificMethod' } } } } } },
        },
        post: {
          tags: ['Métodos Científicos'],
          summary: 'Cria método com imagens (transação)',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ScientificMethod' } } } },
          responses: {
            '201': { description: 'Método criado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ScientificMethod' } } } },
            '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/scientific-methods/{id}': {
        put: {
          tags: ['Métodos Científicos'],
          summary: 'Atualiza método e recarrega imagens (transação)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ScientificMethod' } } } },
          responses: {
            '200': { description: 'Método atualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ScientificMethod' } } } },
            '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        delete: {
          tags: ['Métodos Científicos'],
          summary: 'Remove um método científico',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '204': { description: 'Método removido' }, '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } } },
        },
      },

      // ── Checklist Questions ────────────────────────────────────────────────
      '/api/checklist-questions': {
        get: {
          tags: ['Perguntas Checklist'],
          summary: 'Lista todas as perguntas de checklist',
          responses: { '200': { description: 'Array de perguntas', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/ChecklistQuestion' } } } } } },
        },
        post: {
          tags: ['Perguntas Checklist'],
          summary: 'Cria pergunta com associações de funções (transação)',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ChecklistQuestion' } } } },
          responses: {
            '201': { description: 'Pergunta criada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ChecklistQuestion' } } } },
            '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/checklist-questions/{id}': {
        put: {
          tags: ['Perguntas Checklist'],
          summary: 'Atualiza pergunta e recarrega funções (transação)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ChecklistQuestion' } } } },
          responses: {
            '200': { description: 'Pergunta atualizada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ChecklistQuestion' } } } },
            '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        delete: {
          tags: ['Perguntas Checklist'],
          summary: 'Remove uma pergunta de checklist',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '204': { description: 'Pergunta removida' }, '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } } },
        },
      },

      // ── Biomechanical Factors ──────────────────────────────────────────────
      '/api/biomechanical-factors': {
        get: {
          tags: ['Fatores Biomecânicos'],
          summary: 'Lista todos os fatores de risco biomecânico com categorias',
          responses: { '200': { description: 'Array de fatores', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/BiomechanicalFactor' } } } } } },
        },
        post: {
          tags: ['Fatores Biomecânicos'],
          summary: 'Cria fator com categorias (transação)',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BiomechanicalFactor' } } } },
          responses: {
            '201': { description: 'Fator criado', content: { 'application/json': { schema: { $ref: '#/components/schemas/BiomechanicalFactor' } } } },
            '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/biomechanical-factors/{id}': {
        put: {
          tags: ['Fatores Biomecânicos'],
          summary: 'Atualiza fator e recarrega categorias (transação)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BiomechanicalFactor' } } } },
          responses: {
            '200': { description: 'Fator atualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/BiomechanicalFactor' } } } },
            '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        delete: {
          tags: ['Fatores Biomecânicos'],
          summary: 'Remove um fator biomecânico',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '204': { description: 'Fator removido' }, '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } } },
        },
      },

      // ── Illuminance Params ─────────────────────────────────────────────────
      '/api/illuminance-params': {
        get: {
          tags: ['Parâmetros Iluminância'],
          summary: 'Lista todos os parâmetros normativos de iluminância',
          responses: { '200': { description: 'Array de parâmetros', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/IlluminanceParam' } } } } } },
        },
        post: {
          tags: ['Parâmetros Iluminância'],
          summary: 'Cria um novo parâmetro de iluminância',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/IlluminanceParam' } } } },
          responses: {
            '201': { description: 'Parâmetro criado', content: { 'application/json': { schema: { $ref: '#/components/schemas/IlluminanceParam' } } } },
            '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/illuminance-params/{id}': {
        put: {
          tags: ['Parâmetros Iluminância'],
          summary: 'Atualiza um parâmetro de iluminância',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/IlluminanceParam' } } } },
          responses: {
            '200': { description: 'Parâmetro atualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/IlluminanceParam' } } } },
            '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        delete: {
          tags: ['Parâmetros Iluminância'],
          summary: 'Remove um parâmetro de iluminância',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '204': { description: 'Parâmetro removido' }, '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } } },
        },
      },

      // ── Projects ───────────────────────────────────────────────────────────
      '/api/projects': {
        get: {
          tags: ['Projetos'],
          summary: 'Lista todos os projetos (ordenados por data de criação)',
          responses: { '200': { description: 'Array de projetos', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Project' } } } } } },
        },
        post: {
          tags: ['Projetos'],
          summary: 'Cria ou atualiza (upsert) um projeto — corpo armazenado como JSONB',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Project' } } } },
          responses: {
            '201': { description: 'Projeto salvo', content: { 'application/json': { schema: { $ref: '#/components/schemas/Project' } } } },
            '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/projects/{id}': {
        put: {
          tags: ['Projetos'],
          summary: 'Atualiza um projeto (atualiza timestamp)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Project' } } } },
          responses: {
            '200': { description: 'Projeto atualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Project' } } } },
            '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        delete: {
          tags: ['Projetos'],
          summary: 'Remove um projeto',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '204': { description: 'Projeto removido' }, '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } } },
        },
      },

      // ── Clients ────────────────────────────────────────────────────────────
      '/api/clients': {
        get: {
          tags: ['Clientes'],
          summary: 'Lista todos os clientes (ordenados por nome da empresa)',
          responses: { '200': { description: 'Array de clientes', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Client' } } } } } },
        },
        post: {
          tags: ['Clientes'],
          summary: 'Cria ou atualiza (upsert) um cliente — corpo armazenado como JSONB',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Client' } } } },
          responses: {
            '201': { description: 'Cliente salvo', content: { 'application/json': { schema: { $ref: '#/components/schemas/Client' } } } },
            '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/clients/{id}': {
        put: {
          tags: ['Clientes'],
          summary: 'Atualiza um cliente',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Client' } } } },
          responses: {
            '200': { description: 'Cliente atualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Client' } } } },
            '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        delete: {
          tags: ['Clientes'],
          summary: 'Remove um cliente',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '204': { description: 'Cliente removido' }, '500': { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } } },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
