const PROTOCOL = "http://";

function getInputToURL(id,radioValue=false,isCheckNullRadio=false){
    let form = document.getElementById(id);
    let input = form.getElementsByTagName('input');
    let select = form.getElementsByTagName('select');
    let textarea = form.getElementsByTagName('textarea');
    let params="";
    let check=false;
    for(let item of input){
    	if(item.hasAttribute('name')){
    		if(item.type=="radio"||item.type=="checkbox"){
    			if(item.checked||isCheckNullRadio){
    				if(radioValue){
    					if(!check){
    						params+=item.name+"="+encodeURIComponent(item.value);
    						check=true;
    					}else{
    						params+="&"+item.name+"="+encodeURIComponent(item.value);
    					}
        			}else{
        				if(!check){
    						params+=item.name+"="+Number(item.checked);
    						check=true;
    					}else{
    						params+="&"+item.name+"="+Number(item.checked);
    					}
        			}
    			}
       		}else if(item.value!=""&&item.value!=null){
       			if(!check){
    				params+=item.name+"="+encodeURIComponent(item.value);
    				check=true;
    			}else{
    				params+="&"+item.name+"="+encodeURIComponent(item.value);
    			}
    		}
    	}
    }
    for(let item of textarea){
    	if(item.value!=""&&item.value!=null&&item.hasAttribute('name')){
        	if(!check){
    			params+=item.name+"="+encodeURIComponent(item.value);
    			check=true;
    		}else{
    			params+="&"+item.name+"="+encodeURIComponent(item.value);
    		}
    	}
    }
    for(let item of select){
    	if(item.options[item.selectedIndex].value!=""&&item.options[item.selectedIndex].value!=null&&item.hasAttribute('name')){
    		if(!check){
    			params+=item.name+"="+encodeURIComponent(item.options[item.selectedIndex].value);
    			check=true;
    		}else{
    			params+="&"+item.name+"="+encodeURIComponent(item.options[item.selectedIndex].value);
    		}
        }
    }
	if(params=="") return null;
    return params;
}

function CreateAjax(){
    let Request = false
    if (window.XMLHttpRequest)
    {
        Request = new XMLHttpRequest()
    }else if (window.ActiveXObject){
        try
        {
            Request = new ActiveXObject("Microsoft.XMLHTTP")
        }    
        catch (CatchException)
        {
            Request = new ActiveXObject("Msxml2.XMLHTTP")
        }
    }
    if (!Request)
        console.log("Невозможно создать XMLHttpRequest")
    return Request
}

function ajax(method,url,params,action=null,progress=null,file=false,responseType='json'){
    let Req = CreateAjax()
    Req.responseType=responseType
    Req.onreadystatechange= function(){
        if(Req.readyState==4&&action!=null){
            action(Req);
        }
    }
    if(progress!=null){
        Req.upload.onprogress=progress
    }
    Req.open(method,url,true)
    if(method.toLowerCase()=="post"){
        if(!file){
            Req.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
        }
        Req.send(params)
    }else if(method.toLowerCase()=="get"){
        Req.send()
    }
    return Req.readyState
}

function toggleCartProduct(event,callback){
    let button = event.currentTarget
    if(button.hasAttribute('data-pid')){
        let param = 'pid='+button.getAttribute('data-pid');
        ajax('POST',window.location+"/toggle-product",param,function({response}){
            if(response.success==1){
                let counter = document.getElementById('nav-product-counter')
                if(response.count>0){
                    counter.textContent=response.count
                    counter.classList.remove('d-none')
                }else{
                    counter.classList.add('d-none')
                }
                callback(response,button)
            }
        });
    }
}

function toggleCountCartProduct(pid,value){
    let param = `pid=${pid}&count=${value}`;
    ajax('POST',window.location+"/toggle-count-product",param,function({response}){
        if(response.success==1){
            let container = document.querySelector(`.cart-item[data-pid="${pid}"]`)
            let allPrice = document.getElementById('all-price')
            if(container){
                let payPrice = container.getElementsByClassName('pay-price')[0]
                payPrice.textContent = response.newPrice.toFixed(2)+'$'
                payPrice.setAttribute('data-pay-price',response.newPrice)
                allPrice.textContent = response.allPrice.toFixed(2)+'$'
                allPrice.setAttribute('data-all-price',response.allPrice)
            }
        }
    });
}

function getProducts(event,callback){
    let param=''
    if(event.currentTarget.hasAttribute('data-page')){
        param+="page="+event.currentTarget.getAttribute('data-page')
    }
    let filter = getInputToURL('price-filter')
    param+=filter!=null?(param!=''?'&'+filter:filter):''
    filter = getInputToURL('brand-filter',true)
    param+=filter!=null?(param!=''?'&'+filter:filter):''
    let loadCont=document.getElementById('load-container')
    loadCont.classList.remove('d-none')
    ajax('POST',window.location+"/get-products",param,function({response}){
        loadCont.classList.add('d-none');
        if(response.success==1){
            let cont = document.getElementById('product-list')
            while(cont.children.length){
                cont.removeChild(cont.children[0])
            }
            cont.innerHTML+=response.products
            let controls = document.getElementById('page-controls')
            if(controls!=null){
                cont = controls.parentElement
                cont.removeChild(controls)
            }
            if(response.pageControl!=""){
                cont = document.getElementById('product-container')
                cont.innerHTML+=(response.pageControl)
            }
            callback()
        }
    }); 
}

function placeOrder(){
    ajax('GET','https://app.aaccent.su/js/confirm.php',null,function({response}){
        if(response.result=='ok'){
            ajax('POST',window.location+"/place-order",null,function({response}){
                if(response.success==1){
                    let message = document.getElementById('popup-message')
                    message.insertAdjacentHTML("afterbegin",response.message)
                    togglePopup(null,'popup-message')
                    let container = document.getElementById('cart-container')
                    if(container){
                        while(container.children.length){
                            container.removeChild(container.children[0])
                        }
                        let noData = document.getElementById('no-data');
                        noData.classList.remove('d-none');
                        noData.textContent='Вы пока не добавили ни одного товара в корзину'
                        let pCounter = document.getElementById('p-counter');
					    pCounter.textContent=0;
                        let navCounter = document.getElementById('nav-product-counter');
                        navCounter.textContent=0;
                        navCounter.classList.add('d-none');
                    }
                }
            });
        }
    })
    
}


