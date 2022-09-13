
function onDeleteCmt(e){
	const btn=e.target
    const id=btn.dataset.id
    let a = confirm("Xác nhận xóa")
    if(a===true){
        window.location.replace('/deleteCmt/'+id)
    }
}


$(document).ready(function(){

    $('#icon').click(function(){
        $('ul').toggleClass('show');
    })  
    
    var records_per_page = 8;
    temp=$('.item')
    countPage=temp.length/records_per_page

    for(var i=0;i<countPage;i++){
        $('.pagination').append(`<li class="numpage page-item" id="${i+1}"><a class="page-link">${i+1}</a></li>`)
    }
    $('#1').addClass("active");

    function changePage(page){
        $('#home').html('')
        html=''
        for (var i = (page-1) * records_per_page; i < (page * records_per_page) && i < temp.length; i++) {
            html+=temp[i].outerHTML+"<br>"
        }
        $('#home').html(html)
    }

    changePage(1)

    $('.numpage').click(function(e){
        var page = $(this).attr('id')
        $('li.active').removeClass('active');
        $(this).addClass("active");
        changePage(page)
    })

    $('.supplierDeleteBtn').click(e=>{
        const btn=e.target
        const id=btn.dataset.id
        $('#btn-delete-confirm').attr('href',`supplier/${id}?_method=DELETE`)
        $('#confirm-delete-dialog').modal('show')
    })

    $('.softwareDeleteBtn').click(e=>{
        const btn=e.target
        const id=btn.dataset.id
        $('#btn-delete-confirm').attr('href',`software/${id}?_method=DELETE`)
        $('#confirm-delete-dialog').modal('show')
    })

    $('.staffAddbtn').click(e=>{
        const btn=e.target
        const id=btn.dataset.id
        const name=btn.dataset.name
        $('.modal-body').html(`Xác nhận thêm <b>${name}</b> thành nhân viên`)
        $('#btn-addStaff-confirm').attr('href',`addStaff/${id}?_method=PUT`)
        $('#confirm-addStaff-dialog').modal('show')
    })

    $('.staffDeletebtn').click(e=>{
        const btn=e.target
        const id=btn.dataset.id
        const name=btn.dataset.name
        $('.modal-body').html(`Xác nhận xóa nhân viên <b>${name}</b>`)
        $('#btn-deleteStaff-confirm').attr('href',`staffManager/${id}?_method=DELETE`)
        $('#confirm-deleteStaff-dialog').modal('show')
    })

    $('.buyBtn').click(e=>{
        $('#confirm-buy-dialog').modal('show')
    })

})