let isMobile=false
window.addEventListener('load', ()=>{
	isMobile = window.matchMedia("(max-width:1023px) and (max-height:1023px)")
	loadPage()
	let deployBtns = document.getElementsByClassName('deploy-btn')
	for(let button of deployBtns){
		button.addEventListener('click',deployment)
	}
	let navBtn = document.getElementById('nav-menu-btn')
	if(navBtn){
		navBtn.addEventListener('click',navToggle)}
	let popupButtons = document.getElementsByClassName('popup-button')
	for(let button of popupButtons){
    	button.addEventListener('click',togglePopup)
    }

})
window.addEventListener('resize',()=>{
	isMobile = window.matchMedia("(max-width:1023px) and (max-height:1023px)")
})

function loadPage(){
	switch(document.body.id){
		case 'catalog-page':
			let addButtons = document.getElementsByClassName('add-product-button')
			for(let button of addButtons){
				button.onclick=(ev)=>toggleCartProduct(ev,(response,btn)=>{
					if(response.add)
						btn.classList.add('add-product-button-active')
                	else    
						btn.classList.remove('add-product-button-active')
					btn.textContent=response.textBtn;
				})
			}
			let pageButtons = document.getElementsByClassName('pg-control')
			for(let button of pageButtons){
				button.onclick=(ev)=>getProducts(ev,loadPage)
			}
			let filterButton=document.getElementById('add-filter-button')
			filterButton.onclick=(ev)=>getProducts(ev,loadPage)
			break
		case 'cart-page':
			let counters = document.getElementsByClassName('switch-product-count')
			for(let counter of counters){
				let pid = counter.hasAttribute('data-pid')?counter.getAttribute('data-pid'):null
				let arrows = counter.getElementsByClassName('counter-arrow')
				let counterInput=counter.getElementsByClassName('counter-input')[0]
				counterInput.addEventListener('input',(event)=>{
					let value = event.target.value
					if(!/[0-9]/.test(value[value.length-1]))
						value = value.slice(0,-1)
					event.target.value=value>0?value:1
				})
				if(arrows.length==2)
					arrows[0].addEventListener('click',()=>{
						let value = Number(counterInput.value)+1
						counterInput.value = value
						if(pid!=null){
							toggleCountCartProduct(pid,value)
						}
					})
					arrows[1].addEventListener('click',()=>{
						let value = Number(counterInput.value)-1
						counterInput.value = value>0?value:1
						if(pid!=null){
							toggleCountCartProduct(pid,value>0?value:1)
						}
					})
			}
			let deleteButtons = document.getElementsByClassName('delete-product-button')
			for(let button of deleteButtons){
				button.addEventListener('click',(ev)=>toggleCartProduct(ev,(response,btn)=>{
					let pid=btn.getAttribute('data-pid');
					let item = document.querySelector(`.cart-item[data-pid="${pid}"]`)
					if(item){
						let allPrice = document.getElementById('all-price')
						let payPrice = item.getElementsByClassName('pay-price')[0]
                		if(payPrice.hasAttribute('data-pay-price')&&allPrice.hasAttribute('data-all-price')){
							allValue = Number(allPrice.getAttribute('data-all-price'))
							priceValue = Number(payPrice.getAttribute('data-pay-price'))
							allPrice.textContent=(allValue-priceValue).toFixed(2)+'$'
							allPrice.setAttribute('data-all-price',(allValue-priceValue).toFixed(2))
						}
						item.parentElement.removeChild(item)
					}
					let pCounter = document.getElementById('p-counter');
					pCounter.textContent=response.count
					let allProducts=document.getElementsByClassName('cart-item');
					if(!allProducts.length){
						let container = document.getElementById('cart-container')
						if(container){
							container.parentElement.removeChild(container)
							let noData = document.getElementById('no-data');
							noData.classList.remove('d-none');
							noData.textContent='Вы пока не добавили ни одного товара в корзину'
						}
					}
				}))
			}
			let placeOrderButton=document.getElementById('place-order-button')
			if(placeOrderButton){
				placeOrderButton.onclick = placeOrder
			}
	}
}

function togglePopup(event,id=null){
	let popup=null;
	let bg = document.getElementsByClassName('popup-back')[0];
	if(id!=null){
		popup = document.getElementById(id);
	}else if(event!=null){
		if(event.target.hasAttribute('data-target')){
			popup = document.getElementById(event.target.getAttribute('data-target'));			
		}
	}
	if(popup!=null){
		if(bg.classList.contains("popup-back-active")){
			bg.classList.remove("popup-back-opacity");
			setTimeout(()=>{
				bg.classList.remove("popup-back-active");
				popup.classList.add('d-none');
			},1000);  
		}else{
			popup.classList.remove('d-none');
			bg.classList.add("popup-back-active");
			bg.classList.add("popup-back-opacity");
		} 
	}else{
		return;
	}	
}

function addProduct(event){
	let cart = localStorage.getItem('cart')??[]
	if(event.currentTarget.hasAttribute('data-pid')){
		let pid = event.currentTarget.getAttribute('data-pid')
		if(cart.findIndex(el=>el.id==pid)!=-1){
			event.currentTarget.classList.remove('add-product-button-active')
			event.currentTarget.textContent='🛒 В корзину'
		}else{
			event.currentTarget.classList.add('add-product-button-active')
			event.currentTarget.textContent='🛒 Убрать из корзины'
		}
	}
}

function navToggle(){
	let navBg=document.getElementById('nav-bg')
	let navMenu = document.getElementById('nav-menu')
	navBg.classList.toggle('nav-bg-active')
	navMenu.classList.toggle('nav-menu-active')
}

function deployment(event){
	if(event.currentTarget.hasAttribute('data-target')){
		if(event.currentTarget.hasAttribute('data-active-class')){
			event.currentTarget.classList.toggle(event.currentTarget.getAttribute('data-active-class'))
		}
		let container = document.getElementById(event.currentTarget.getAttribute('data-target'))
		if(container)
			container.classList.toggle(isMobile?'h-m-0':'h-0')
	}
}