/**
** EXAMPLE USAGE **
	async function someFunc(){	
		if(!(await Signn.checkStatus())){
			return; // Not logged in
		}
	}
**/
class SignIn {
	constructor(){}
	
	async checkStatus(){
		try {
			const resp = await fetch('index/is-signed-in');
			const json = await resp.json();
			if(json.status===false){
				this.showForm();
			}
			return json.status;
		} catch(err){
			Swal.fire({
				type: 'info',
				title: 'Oops! There may be an issue with your internet connection.',
				text: 'Please check your internet connection and try again. If the problem persists you may need to contact your ISP(Internet Service Provider).'
			});
			return false;
		}
	}
	
	showForm(){
		let me = this;
		Swal.fire({
			type: 'info',
			title: 'Your session has timed out',
			html: `<p>Please sign in below.</p><input type="text" id="SignIn-user" class="swal2-input" placeholder="Email address">
			<input type="password" id="SignIn-password" class="swal2-input" placeholder="Password">`,
			confirmButtonText: 'Sign in',
			focusConfirm: false,
			preConfirm: () => {
				const login = Swal.getPopup().querySelector('#SignIn-user').value;
				const password = Swal.getPopup().querySelector('#SignIn-password').value;
				if (!login || !password) {
					Swal.showValidationMessage(`Please enter email and password`);
				}
				return { login: login, password: password };
			}
		}).then((result) => {
			if(result && result.value!=undefined){
				$.ajax({
					url: 'index/signin',
					type: 'post',
					data: {
						'txt-email': result.value.login,
						'txt-password': result.value.password,
						'chck-rememberme': 1
					},
					dataType: 'json',
					success: (res)=>{
						if(res.status){
							Swal({type:'success',title:'You have successfully signed in!',timer:1500,showConfirmButton:false});
						} else {
							Swal({
								 type:'warning'
								,title:'There was an issue with your email or password!'
								,timer:3000
								,showConfirmButton: false
							}).then((res)=>{
								me.showForm();								
							});
						}
					}
				});
			}
		});
	}
	
};
const Signn = new SignIn();