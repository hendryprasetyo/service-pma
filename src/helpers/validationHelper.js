const Joi = require('joi')

const noBoundarySpace = /^\S(?:.*\S)?$/ // regex: tidak mulai/spasi akhir
const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
// passwordPattern  -> Syarat password “kuat”:
//  *        - ≥ 8 karakter
//  *        - ≥ 1 huruf kecil
//  *        - ≥ 1 huruf besar
//  *        - ≥ 1 angka
//  *        - ≥ 1 simbol dari @$!%*?&
//  *        - (ditambah regex noBoundarySpace agar tidak ada spasi di pinggir)
const uuidSchema = Joi.string().uuid().required().messages({
  'string.guid': 'Invalid id',
})

const RegisterValiation = reqBody => {
  const schema = Joi.object({
    name: Joi.string().pattern(noBoundarySpace).min(3).required().messages({
      'string.base': 'name must be a string',
      'string.empty': 'name is required',
      'string.min': 'name must be at least 3 characters',
      'string.pattern.base': 'name cannot start or end with space',
      'any.required': 'name is required',
    }),
    email: Joi.string().lowercase().trim().email().required().messages({
      'string.email': 'email is invalid',
      'string.empty': 'email is required',
      'any.required': 'email is required',
    }),
    password: Joi.string()
      .pattern(passwordPattern)
      .pattern(noBoundarySpace)
      .required()
      .messages({
        'string.pattern.base':
          'password min 8 chars, with upper, lower, number, symbol & no leading/trailing space',
        'string.empty': 'password is required',
        'any.required': 'password is required',
      }),
    confirm_password: Joi.string()
      .required()
      .valid(Joi.ref('password')) // harus sama persis
      .messages({
        'any.only': 'confirm password must match password',
        'string.empty': 'confirm password is required',
        'any.required': 'confirm password is required',
      }),
  }).required()
  const { error } = schema.validate(reqBody, {
    abortEarly: false,
  })

  if (error) {
    return error.details.map(err => err.message).join(', ')
  }

  return null
}

const LoginValiation = reqBody => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'email is invalid',
      'string.empty': 'email is required',
      'any.required': 'email is required',
    }),
    password: Joi.string()
      .pattern(passwordPattern)
      .pattern(noBoundarySpace)
      .messages({
        'string.pattern.base':
          'password min 8 chars, with upper, lower, number, symbol & no leading/trailing space',
      }),
  }).required()
  const { error } = schema.validate(reqBody, {
    abortEarly: false,
  })

  if (error) {
    return error.details.map(err => err.message).join(', ')
  }

  return null
}
const taskSchema = Joi.object({
  title: Joi.string().min(3).required().messages({
    'string.base': 'Task title must be a string',
    'string.empty': 'Task title is required',
    'string.min': 'Task title must be at least 3 characters',
    'any.required': 'Task title is required',
  }),
  description: Joi.string().min(10).required().messages({
    'string.base': 'Task description must be a string',
    'string.empty': 'Task description is required',
    'string.min': 'Task description must be at least 10 characters',
    'any.required': 'Task description is required',
  }),
  status: Joi.string()
    .valid('todo', 'in-progress', 'done')
    .default('todo')
    .messages({
      'any.only': 'Status must be one of: todo, in-progress, done',
    }),
  assigneeId: uuidSchema,
}).required()

const CreateProjectValiation = reqBody => {
  const schema = Joi.object({
    title: Joi.string().pattern(noBoundarySpace).min(3).required().messages({
      'string.base': 'title must be a string',
      'string.empty': 'title is required',
      'string.min': 'title must be at least 3 characters',
      'string.pattern.base': 'title cannot start or end with space',
      'any.required': 'title is required',
    }),
    tasks: Joi.array().items(taskSchema).optional(),
  }).required()
  const { error } = schema.validate(reqBody, {
    abortEarly: false,
  })

  if (error) {
    return error.details.map(err => err.message).join(', ')
  }

  return null
}

const CreateTaskValiation = reqBody => {
  const schema = Joi.object({
    projectId: uuidSchema,
    tasks: Joi.array().items(taskSchema).required(),
  })
  const { error } = schema.validate(reqBody, {
    abortEarly: false,
  })

  if (error) {
    return error.details.map(err => err.message).join(', ')
  }

  return null
}

const GetProjectsValiation = reqBody => {
  const schema = Joi.object({
    search: Joi.string().trim().allow('', null).messages({
      'string.base': 'Search must be a string',
    }),

    limit: Joi.number().integer().min(1).max(100).default(10).messages({
      'number.base': 'Limit must be a number',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit must not exceed 100',
    }),

    page: Joi.number().integer().min(1).default(1).messages({
      'number.base': 'Page must be a number',
      'number.min': 'Page must be at least 1',
    }),

    orderBy: Joi.string()
      .valid('name', 'createdAt', 'updatedAt')
      .default('createdAt')
      .messages({
        'any.only': 'OrderBy must be one of name, createdAt, or updatedAt',
      }),

    order: Joi.string().valid('asc', 'desc').default('desc').messages({
      'any.only': 'Order must be either asc or desc',
    }),
  })
  const { error } = schema.validate(reqBody, {
    abortEarly: false,
  })

  if (error) {
    return error.details.map(err => err.message).join(', ')
  }

  return null
}

const GetProjectDetailValiation = request => {
  const schema = Joi.object({
    id: uuidSchema,
    status: Joi.string()
      .valid('todo', 'in-progress', 'done')
      .default('todo')
      .messages({
        'any.only': 'Status must be one of: todo, in-progress, done',
      }),
  })
  const { error } = schema.validate(request, {
    abortEarly: false,
  })

  if (error) {
    return error.details.map(err => err.message).join(', ')
  }

  return null
}

const UpdateTaskValiation = reqBody => {
  const schema = Joi.object({
    projectId: uuidSchema,
    taskId: uuidSchema,
    status: Joi.string()
      .valid('todo', 'in-progress', 'done')
      .default('todo')
      .messages({
        'any.only': 'Status must be one of: todo, in-progress, done',
      }),
  })
  const { error } = schema.validate(reqBody, {
    abortEarly: false,
  })

  if (error) {
    return error.details.map(err => err.message).join(', ')
  }

  return null
}

module.exports = {
  RegisterValiation,
  LoginValiation,
  CreateProjectValiation,
  CreateTaskValiation,
  GetProjectsValiation,
  GetProjectDetailValiation,
  UpdateTaskValiation,
}
