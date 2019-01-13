check()

function check () {
  const urlQuery = new URLSearchParams(window.location.search)
  const googleToken = urlQuery.get('token')
  const token = localStorage.getItem('token')
  if (!googleToken) {
    if (!token) {
      $('.outside').show()
      $('.inside').hide()
    } else {
      setTodo()
      setProject()
      $('.outside').hide()
      $('.inside').show()
    }
  } else {
    localStorage.setItem('token', googleToken)
    window.location.href = 'http://localhost:8080/#'
    check()
  }
}

$('#signupForm').submit(async function (event) {
  event.preventDefault()
  let email = $('#emailSignup').val()
  let password = $('#passwordSignup').val()
  try {
    let { data } = await $.post('http://localhost:3000/user', {
      email: email,
      password: password
    })
    $('#closeSignup').trigger('click')
  } catch ({ responseJSON }) {
    $('#alertSignup').show()
    $('#textSignup').html('')
    for (let i in responseJSON.errors.errors) {
      $('#textSignup').append(`<p>${responseJSON.errors.errors[i].message}</p>`)
    }
  }
})

$('#signinForm').submit(async function (event) {
  event.preventDefault()
  let email = $('#emailSignin').val()
  let password = $('#passwordSignin').val()
  try {
    let { token } = await $.post('http://localhost:3000/user/login', {
      email: email,
      password: password
    })
    localStorage.setItem('token', token)
    $('#closeSignin').trigger('click')
    check()
  } catch ({ responseJSON }) {
    $('#alertSignin').show()
    $('#textSignin').html(responseJSON.message)
  }
})

$('#gSignin').click(function () {
  window.location.replace('https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcalendar%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fplus.login%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&response_type=code&client_id=284622702566-ng345qof3goa7bii90j60j30rqpht468.apps.googleusercontent.com&redirect_uri=https%3A%2F%2Fus-central1-todo-fancy-228403.cloudfunctions.net%2Fgenerate-link-calendar')
})

$('#logout').click(function () {
  localStorage.clear()
  check()
})

async function setTodo () {
  try {
    const todos = await $.ajax({
      method: 'GET',
      url: 'http://localhost:3000/todo',
      headers: {
        'token': localStorage.getItem('token')
      }
    })
    $('#todoList').html('')
    todos.forEach(e => {
      $('#todoList').append(`
        <div class="card-header"><h4>${e.title}</h4></div>
        <div class="card-body text-center">
          <button type="button" class="btn btn-primary" onclick="setDetail('${e._id}', '${e.title}', '${e.description}', '${e.status}', '${e.due_date}')">Detail</button>
        </div>
      `)
    });
  } catch (err) {
    console.error(err)
  }
}

const deleteTodo = async (id) => {
  try {
    const remove = await $.ajax({
      method: 'DELETE',
      url: `http://localhost:3000/todo/${id}`,
      headers: {
        'token': localStorage.getItem('token')
      }
    })
    setTodo()
    $('#detailTodo').html('')
  } catch (err) {
    console.error(err)
  }
} 

function setDetail (id, title, description, status, due) {
  if (JSON.parse(status)) {
    status = 'Done'
  } else {
    status = 'Undone'
  }
  due = moment(due).format("MMM Do YY")
  $('#detailTodo').html(`
      <div class="card-header"><h4>Edit Todo</h4></div>
      <div class="card-body">
        <p class="card-text">Title: ${title}</p>
        <p class="card-text">Description: ${description}</p>
        <p class="card-text">Status: ${status}</p>
        <p class="card-text">Due Date: ${due}</p>
        <button type="button" class="btn btn-primary" onclick="deleteTodo('${id}')">Delete</button>
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#updateModal">Update</button>
      </div>

      <div class="modal fade" id="updateModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-body" id="exampleModalLabel">Update</h5>
            <button type="button" class="close" id="closeUpdate" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="container">
              <form id="updateForm">
                  <div class="form-group">
                    <label class="text-body">Title:</label>
                    <input type="text" class="form-control" id="titleUpdate" placeholder="Title" value="${title}">
                  </div>
                  <div class="form-group">
                    <label class="text-body">Description:</label>
                    <input type="text" class="form-control" id="descriptionUpdate" placeholder="Description" value="${description}">
                  </div>
                  <div class="form-group">
                    <label class="text-body">Status:</label>
                    <select class="custom-select" id="statusUpdate">
                      <option value="true">Done</option>
                      <option value="false">Undone</option>
                    </select>
                  </div>
                  <div class="text-center">
                    <button type="button" id="submitButton" class="btn btn-primary" onclick="updateTodo('${id}')">Submit</button>
                  </div>
                </form>
              </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  `)
}

async function updateTodo (id) {
  let title = $('#titleUpdate').val()
  let description = $('#descriptionUpdate').val()
  let status = $('#statusUpdate').val()
  try {
    const updated = await $.ajax({
      method: 'PUT',
      url: `http://localhost:3000/todo/${id}`,
      data: {
        title: title,
        description: description,
        status: status
      },
      headers: {
        token: localStorage.getItem('token')
      }
    })
    $('#closeUpdate').trigger('click')
    setTodo()
    setTimeout(() => {
      setDetail(updated._id, updated.title, updated.description, updated.status)
    }, 500);
  } catch (err) {
    console.errors(err)
  }
}

$('#createForm').submit(async (event) => {
  event.preventDefault()
  let title = $('#titleCreate').val().trim()
  let description = $('#descriptionCreate').val().trim()
  let status = $('#statusCreate').val().trim()
  let date = $('#dateCreate').val().trim()
  try {
    const created = await $.ajax({
      method: 'POST',
      url: 'http://localhost:3000/todo/',
      data: {
        title: title,
        description: description,
        status: status,
        due_date: date
      },
      headers: {
        token: localStorage.getItem('token')
      }
    })
    $('#closeCreate').trigger('click')
    setTodo()
  } catch (err) {
    console.error(err)
  }
})

$('#projectForm').submit(async (event) => {
  event.preventDefault()
  let title = $('#titleProject').val().trim()
  try {
    const project = await $.ajax({
      method: 'POST',
      url: 'http://localhost:3000/project',
      data: {
        name: title
      },
      headers: {
        token: localStorage.getItem('token')
      }
    })
    $('#closeProject').trigger('click')
    setProject()
  } catch (err) {
    console.error(err)
  }
})

async function setProject () {
  const projects = await $.ajax({
    method: 'GET',
    url: 'http://localhost:3000/project/',
    headers: {
      token: localStorage.getItem('token')
    }
  })
  $('#projectList').html('')
  projects.forEach(e => {
    e.member = JSON.stringify(e.member)
    e.todo = JSON.stringify(e.todo)
    $('#projectList').append(`
      <div class="card-header"><h4>${e.name}</h4></div>
      <div class="card-body text-center">
        <button type="button" class="btn btn-primary" onclick='setDetailProject(${e.member}, ${e.todo}, "${e._id}")'>Detail</button>
      </div>
    `)
  });
}

var projectId;

async function setDetailProject (member, todo, id) {
  $('#inviteMember').prop('disabled', false)
  $('#createProjectTodo').prop('disabled', false)
  $('#memberProject').html('')
  $('#projectTodo').html('')
  projectId = id
  member.forEach(e => {
    $('#memberProject').append(`
      <div class="card-header m-3" id="idInvite">${e.email}</div>
    `)
  });
  todo.forEach(e => {
    $('#projectTodo').append(`
      <div class="card-header m-3" >${e}</div>
    `)
  });
}

$('#inviteMember').keypress(async (e) => {
  if (e.which == 13) {
    let email = $('#inviteMember').val().trim()
    try {
      const invited = await $.ajax({
        method: 'PUT',
        url: `http://localhost:3000/project/invite/${projectId}`,
        data: {
          email: email
        },
        headers: {
          token: localStorage.getItem('token')
        }
      })
      $('#inviteMember').val('')
      $('#alertInvite').hide()
      $('#memberProject').append(`
        <div class="card-header m-3" id="idInvite">${email}</div>
      `)
      setProject()
    } catch ({ responseJSON }) {
      $('#alertInvite').show()
      $('#textInvite').html(responseJSON.message)
    }
  }
})

$('#createProjectTodo').keypress(async (e) => {
  if (e.which == 13) {
    let todo = $('#createProjectTodo').val().trim()
    try {
      const newTodo = $.ajax({
        method: 'PUT',
        url: `http://localhost:3000/project/todo/${projectId}`,
        data: {
          todo: todo
        },
        headers: {
          token: localStorage.getItem('token')
        }
      })
      $('#createProjectTodo').val('')
      $('#projectTodo').append(`
        <div class="card-header m-3" >${todo}</div>
      `)
      setProject()
    } catch (err) {
      console.error(err)
    }
  }
})