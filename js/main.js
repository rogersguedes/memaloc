function Computer(memSize, so_size, procs, segs, alloc, cpuTt){
	this.memorySize = memSize;
	this.SOSize = so_size;
	this.processes = procs;
	this.segmentList = segs;
	this.allocationMethod = alloc;
	this.nextFitLastSegmentStart = 0;
	this.cpuTickTime = cpuTt;
	
	this.processTME = function(){
		var allWatingTimes = 0;
		var cont = 0;
		while(cont < this.processes.length && this.processes[cont].waitingTime != undefined){
			allWatingTimes += this.processes[cont].waitingTime;
			cont++;
		}
		if(cont == 0){
			return 0;
		}
		var tem = Math.floor((allWatingTimes/cont) * 100) / 100;
		return tem;
	}
	
	this.thereIsWaitingProcessBeforeThis = function (procIndex){
		var temProcessoEsperando = false;
		var cont=0;
		while(this.processes[cont].arriveTime < this.processes[procIndex].arriveTime){//procurar nos processos que chegaram antes do processo sendo analisado (i);
			//Se o processo que chegou antes (cont) do processo sendo analisado (i) esta esperando
			if(this.processes[procIndex].PID != this.processes[cont].PID && this.processes[cont].segment == undefined && this.processes[cont].cpuTime < this.processes[cont].duration){// Se o processo atualmente sendo analisado nao tiver sido alocado e seu tempo de CPU for menor que o tempo de duracao eh pq ele esta esperando um segmento.
				temProcessoEsperando = true;
			}
			cont++;
		}
		return temProcessoEsperando;
	}
	
	this.firstFitFreeSegmentIndex = function(procIndex){
		var temSegmentoLivre = false;
		var freeSegmentIndex = 0;
		while(freeSegmentIndex < window.ourComputer.segmentList.length && !temSegmentoLivre){
			if(window.ourComputer.segmentList[freeSegmentIndex].type == "free" && window.ourComputer.segmentList[freeSegmentIndex].size >= window.ourComputer.processes[procIndex].size){
				temSegmentoLivre = true;
			}
			freeSegmentIndex++;
		}
		freeSegmentIndex--;
		if(temSegmentoLivre){
			return freeSegmentIndex;
		}
		else{
			return -1;
		}
	}
	
	this.bestFitFreeSegmentIndex = function(procIndex){
		var temSegLivre = false;
		var smallerSegIndex;
		for(counter = 0; counter < window.ourComputer.segmentList.length ; counter++){
			if(!temSegLivre && window.ourComputer.segmentList[counter].type == "free" && window.ourComputer.segmentList[counter].size >= window.ourComputer.processes[procIndex].size){
				temSegLivre = true;
				smallerSegIndex = counter;
			}
			else{
				if(temSegLivre && window.ourComputer.segmentList[counter].type == "free" && window.ourComputer.segmentList[counter].size >= window.ourComputer.processes[procIndex].size && window.ourComputer.segmentList[counter].size < window.ourComputer.segmentList[smallerSegIndex].size){
					smallerSegIndex = counter;
				}
			}
		}
		if(temSegLivre){
			return smallerSegIndex;
		}
		else{
			return -1;
		}
	}
	
	this.worstFitFreeSegmentIndex = function(procIndex){
		var temSegLivre = false;
		var smallerSegIndex;
		for(counter = 0; counter < window.ourComputer.segmentList.length ; counter++){
			if(!temSegLivre && window.ourComputer.segmentList[counter].type == "free" && window.ourComputer.segmentList[counter].size >= window.ourComputer.processes[procIndex].size){
				temSegLivre = true;
				smallerSegIndex = counter;
			}
			else{
				if(temSegLivre && window.ourComputer.segmentList[counter].type == "free" && window.ourComputer.segmentList[counter].size >= window.ourComputer.processes[procIndex].size && window.ourComputer.segmentList[counter].size > window.ourComputer.segmentList[smallerSegIndex].size){
					smallerSegIndex = counter;
				}
			}
		}
		if(temSegLivre){
			return smallerSegIndex;
		}
		else{
			return -1;
		}
	}
	
	this.nextFitFreeSegmentIndex = function(procIndex){
		var nextFitLastSegmentIndex = 0;
		var nextFitLastSegmentFound = false;
		var k = 0 ;
		while(k < window.ourComputer.segmentList.length && !nextFitLastSegmentFound){
			if(window.ourComputer.segmentList[k].start >= window.ourComputer.nextFitLastSegmentStart){
				nextFitLastSegmentIndex = k;
				nextFitLastSegmentFound = true;
			}
			k++;
		}
		var temSegmentoLivre = false;
		var freeSegmentIndex = 0;
		var nFitSegmentIndex = 0;
		while(freeSegmentIndex < window.ourComputer.segmentList.length && !temSegmentoLivre){
			nFitSegmentIndex = (nextFitLastSegmentIndex + freeSegmentIndex)%window.ourComputer.segmentList.length;
			if(window.ourComputer.segmentList[nFitSegmentIndex].type == "free" && window.ourComputer.segmentList[nFitSegmentIndex].size >= window.ourComputer.processes[procIndex].size){
				temSegmentoLivre = true;
				window.ourComputer.nextFitLastSegmentStart = window.ourComputer.segmentList[nFitSegmentIndex].start;
			}
			freeSegmentIndex++;
		}
		freeSegmentIndex--;
		if(temSegmentoLivre){
			return nFitSegmentIndex;
		}
		else{
			return -1;
		}
	}
	
	this.allocate = function(procIndex, segIndex, instantTime){
		var inicioDoNovoSegmentoOcupado;
		var tamanhoDoNovoSegmentoOcupado;
		var novoSegmentoOcupado;
		
		var inicioDoNovoSegmentoLivre;
		var tamanhoDoNovoSegmentoLivre;
		var novoSegmentoLivre;
		
		if(window.ourComputer.segmentList[segIndex].size == window.ourComputer.processes[procIndex].size){//Se o segmento for do mesmo tamanho do processo.
			window.ourComputer.segmentList[segIndex].type = "process";
			window.ourComputer.segmentList[segIndex].process = window.ourComputer.processes[procIndex];
			window.ourComputer.processes[procIndex].segment = window.ourComputer.segmentList[segIndex];
		}
		else{
			inicioDoNovoSegmentoOcupado = window.ourComputer.segmentList[segIndex].start;
			tamanhoDoNovoSegmentoOcupado = window.ourComputer.processes[procIndex].size;
			
			novoSegmentoOcupado = new Segment("process", inicioDoNovoSegmentoOcupado, tamanhoDoNovoSegmentoOcupado, window.ourComputer.processes[procIndex]);
			
			window.ourComputer.processes[procIndex].segment = novoSegmentoOcupado;
			
			inicioDoNovoSegmentoLivre = window.ourComputer.segmentList[segIndex].start + window.ourComputer.processes[procIndex].size;
			tamanhoDoNovoSegmentoLivre = window.ourComputer.segmentList[segIndex].size - window.ourComputer.processes[procIndex].size;
			
			novoSegmentoLivre = new Segment("free" , inicioDoNovoSegmentoLivre, tamanhoDoNovoSegmentoLivre);
			window.ourComputer.segmentList.splice(segIndex, 1, novoSegmentoOcupado, novoSegmentoLivre);
		}
		window.ourComputer.processes[procIndex].allocationTime = instantTime;
	}
	
	this.deallocate = function(procIndex){
		var contador = 0;
		while(window.ourComputer.processes[procIndex].segment.start != window.ourComputer.segmentList[contador].start){//procura pelo segmento sendo usado pelo processo.
			contador++;
		}
		if(contador == 0){// Se o segmento está no começo da lista de segmentos
			if(window.ourComputer.segmentList.length > 1){//se a lista tiver mais de um segmento.
				if(window.ourComputer.segmentList[contador+1].type == "free"){//Se o próximo segmento for livre
					window.ourComputer.segmentList[contador].size += window.ourComputer.segmentList[contador+1].size;
					window.ourComputer.segmentList[contador].type = "free";
					window.ourComputer.segmentList.splice(contador+1, 1);
				}
				else{
					window.ourComputer.segmentList[contador].type = "free";
				}
			}
			else{//simplesmente torna ele livre
				window.ourComputer.segmentList[contador].type = "free";
			}
		}
		else{
			if(contador == (window.ourComputer.segmentList.length -1) ){//Se for o último segmento da lista
				if(window.ourComputer.segmentList[contador-1].type == "free"){//Se o segmento anterior for livre
					window.ourComputer.segmentList[contador-1].size += window.ourComputer.segmentList[contador].size;// aumenta o tamanho dele.
					window.ourComputer.segmentList.pop();//e remove o ultimo.
				}
				else{
					window.ourComputer.segmentList[contador].type = "free";
				}
			}
			else{
				if(window.ourComputer.segmentList[contador-1].type == "free"){//Se o segmento anterior for livre
					window.ourComputer.segmentList[contador-1].size += window.ourComputer.segmentList[contador].size;//aumenta o tamanho do anterior.
					if(window.ourComputer.segmentList[contador+1].type == "free"){//Se o próximo segmento for livre
						window.ourComputer.segmentList[contador-1].size += window.ourComputer.segmentList[contador+1].size;//aumenta o tamanho do segmento anterior, que é livre tamnbém.
						window.ourComputer.segmentList.splice(contador, 1);//Remove o segmento atual, que quando for removido lah embaixo de novo vai ser o seguinte que vai ser removido.
					}
					else{
						//acho que não precisa de nada nessa situacao.
					}
					window.ourComputer.segmentList.splice(contador, 1);//Remove o segmento atual, que se o proximo segmento for livre eh ele que jah esta aqui e eh ele que vai ser removido
				}
				else{
					if(window.ourComputer.segmentList[contador+1].type == "free"){//Se o próximo segmento for livre
						window.ourComputer.segmentList[contador].size += window.ourComputer.segmentList[contador+1].size;//aumenta o tamanho do segmento.
						window.ourComputer.segmentList[contador].type = "free";
						window.ourComputer.segmentList.splice(contador+1, 1);//Remove o próximo segmento.
					}
					else{
						window.ourComputer.segmentList[contador].type = "free";
					}
				}
			}
		}
		window.ourComputer.processes[procIndex].segment = undefined;//remove do processo a referencia para o segmento
	}
	
	this.allProcessesHasConcluded = function(){
		var i=0;
		var someNotConcluded=false;
		while( i < this.processes.length && !someNotConcluded){
			if(this.processes[i].cpuTime  < this.processes[i].duration){
				someNotConcluded=true;
			}
			i++;
		}
		return !someNotConcluded;
	}
	
	this.renewProcesses = function(){
		var j=0;
		for(j=0 ; j < this.processes.length ; j++){
			this.processes[j].cpuTime = 0;
			this.processes[j].waitingTime = undefined;
		}
	}
}

function Process(pid, siz, arr, dur, cpTime){
	this.PID = pid;
	this.size = siz;
	this.arriveTime = arr;
	this.duration = dur;
	this.cpuTime = cpTime;
	this.segment;
	this.waitingTime;
}

function Segment(tp, st, sz, proc){
	this.type = tp;
	this.start = st;
	this.size = sz;
	this.process = proc;
}

//Global Vars
var ourComputer;
var tempo = 0;

//
var timeoutVar;
window.onload = function(){
	
	//mainForm.reset();
	
	//text fields
	var txtFieldMemorySize = document.getElementById("txtFieldMemorySize");
	var txtFieldSOSize = document.getElementById("txtFieldSOSize");
	var txtFieldMimProcSize = document.getElementById("txtFieldMimProcSize");
	var txtFieldMaxProcSize = document.getElementById("txtFieldMaxProcSize");
	var txtFieldMimProcArrive = document.getElementById("txtFieldMimProcArrive");
	var txtFieldMaxProcArrive = document.getElementById("txtFieldMaxProcArrive");
	var txtFieldMimProcDuration = document.getElementById("txtFieldMimProcDuration");
	var txtFieldMaxProcDuration = document.getElementById("txtFieldMaxProcDuration");
	var txtFieldQuantOfProc = document.getElementById("txtFieldQuantOfProc");
	var txtFieldTickTime = document.getElementById("txtFieldTickTime");
	
	//buttons
	var btnCreateComputer = document.getElementById("btnCreateComputer");
	var btnCreateProcess = document.getElementById("btnCreateProcess");
	var btnFirstFit = document.getElementById("btnFirstFit");
	var btnBestFit = document.getElementById("btnBestFit");
	var btnWorstFit = document.getElementById("btnWorstFit");
	var btnNextFit = document.getElementById("btnNextFit");
	
	//tables
	//var tblMemory = document.getElementById("tblMemory");
	var tblMemory = $("#tblMemory");
	//var tblProcesses = document.getElementById("tblProcesses");
	var tblProcesses = $("#tblProcesses");
	
	btnCreateComputer.onclick = function(){
		if(/^\d+$/.test(txtFieldMemorySize.value) && parseInt(txtFieldMemorySize.value) > 0){//Tamanho da memória
			if(/^\d+$/.test(txtFieldSOSize.value) && parseInt(txtFieldSOSize.value) >= 0 && parseInt(txtFieldSOSize.value) < parseInt(txtFieldMemorySize.value)){//Tamanho do S.O.
				if(/^\d+$/.test(txtFieldTickTime.value) && parseInt(txtFieldTickTime.value) > 0){//Tamanho da memória
					var memorySegmentsList = new Array();//lista dos segmentos de memoria
					if(parseInt(txtFieldSOSize.value) > 0){
						memorySegmentsList.push(new Segment("so", 0, parseInt(txtFieldSOSize.value)));
					}
					memorySegmentsList.push(new Segment("free", (parseInt(txtFieldSOSize.value)),(parseInt(txtFieldMemorySize.value) - parseInt(txtFieldSOSize.value))));
					ourComputer = new Computer(parseInt(txtFieldMemorySize.value), parseInt(txtFieldSOSize.value), new Array(), memorySegmentsList, "firstFit", parseInt(txtFieldTickTime.value));
					console.log(ourComputer);
					window.tempo = 0;//zera o tempo do computador
					window.drawComputerMemory(tblMemory, ourComputer);//desenha a tabela
				}
				else{
					window.alert("O Tempo de Tick do Sistema deve ser um número natural não nulo.");
				}
			}
			else{
				window.alert("O tamanho do S.O. deve ser um número natural menor do que o tamanho da memória do computador.");
			}
		}
		else{
			window.alert("O tamanho da memória do computador deve ser um número natural não nulo.");
		}
	}
	
	btnCreateProcess.onclick = function(){
		if(ourComputer){
			if(/^\d+$/.test(txtFieldMimProcSize.value) && parseInt(txtFieldMimProcSize.value) > 0){//Tamanho dos processos:
				mimProcSize = parseInt(txtFieldMimProcSize.value);
				if(/^\d+$/.test(txtFieldMaxProcSize.value) && parseInt(txtFieldMaxProcSize.value) > parseInt(txtFieldMimProcSize.value) && parseInt(txtFieldMaxProcSize.value) <= ourComputer.memorySize - ourComputer.SOSize){//Tamanho dos processos:
					maxProcSize = parseInt(txtFieldMaxProcSize.value);
					if(/^\d+$/.test(txtFieldMimProcArrive.value) && parseInt(txtFieldMimProcArrive.value) >= 0){//Tempo de Chegada:
						mimProcArrive = parseInt(txtFieldMimProcArrive.value);
						if(/^\d+$/.test(txtFieldMaxProcArrive.value) && parseInt(txtFieldMaxProcArrive.value) > parseInt(txtFieldMimProcArrive.value)){//Tempo de Chegada:
							maxProcArrive = parseInt(txtFieldMaxProcArrive.value);
							if(/^\d+$/.test(txtFieldMimProcDuration.value) && parseInt(txtFieldMimProcDuration.value) > 0){//Tempo de Duração:
								mimProcDuration = parseInt(txtFieldMimProcDuration.value);
								if(/^\d+$/.test(txtFieldMaxProcDuration.value) && parseInt(txtFieldMaxProcDuration.value) > parseInt(txtFieldMimProcDuration.value)){//Tempo de Duração:
									maxProcDuration = parseInt(txtFieldMaxProcDuration.value);
									if(/^\d+$/.test(txtFieldQuantOfProc.value) && parseInt(txtFieldQuantOfProc.value) > 0){//quantidade de processos:
										quantOfProc = parseInt(txtFieldQuantOfProc.value);
										var nextProcArrive;
										if(ourComputer.processes.length > 0){//se o computador jah tiver algum processo.
											nextProcArrive = ourComputer.processes[ourComputer.processes.length-1].arriveTime//pega o tempo de chegada do ultimo processo.
										}
										else{
											nextProcArrive = 0;
										}
										for(i = 0; i < quantOfProc ; i++){
											procSize = mimProcSize + parseInt(Math.random() * ((maxProcSize - mimProcSize) + 1));//sortea o tamanho do novo processo.
											procArrive = mimProcArrive + parseInt(Math.random() * ((maxProcArrive - mimProcArrive) + 1));//sortea o tempo de chagada do novo processo, para se somado mais a frente com o tempo de chagada do ultimo processo da fila.
											procDuration = mimProcDuration + parseInt(Math.random() * ((maxProcDuration - mimProcDuration) + 1));//sortea um tempo de duracao para o novo processo.
											nextProcArrive += procArrive;//soma o tempo de chegada do ultimo processo da fila com o tempo de chegada sorteado para o novo processo gerado.
											var novoProcesso = new Process(ourComputer.processes.length ,procSize, nextProcArrive, procDuration, 0);//cria o novo processo.
											ourComputer.processes.push(novoProcesso);//coloca o novo processo na fila.
										}
										window.drawProcessesTable(tblProcesses, ourComputer.processes);//desenha a tabela
										btnFirstFit.disabled = false;
										btnBestFit.disabled = false;
										btnWorstFit.disabled = false;
										btnNextFit.disabled = false;
									}
									else{
										window.alert("A quantidade de processos deve ser um número natural positivo.");
									}
								}
								else{
									window.alert("O tempo máximo de duração dos processos deve ser um número natural positivo e maior do que o tempo mínimo de duração dos processos.");
								}
							}
							else{
								window.alert("O tempo mínimo de duração dos processos deve ser um número natural positivo.");
							}
						}
						else{
							window.alert("O tempo máximo de chegada dos processos deve ser um número natural positivo e maior do que o tempo mínimo de chegada dos processos.");
						}
					}
					else{
						window.alert("O tempo mínimo de chegada dos processos deve ser um número natural.");
					}
				}
				else{
					window.alert("O tamanho máximo dos processos deve ser um número natural positivo, maior do que o tamanho mínimo dos processos e maior do que o tamanho da memória menos o tamanho do S.O..");
				}
			}
			else{
				window.alert("O tamanho mínimo dos processos deve ser um número natural positivo.");
			}
		}
		else{
			window.alert("Você deve criar primeiro o computador.");
		}
	}
	
	function allocationStep(){
		console.log("tempo: "+window.tempo);
		for(i=0 ; i < window.ourComputer.processes.length ; i++){
			//Se o processo atualmente sendo analisado já tiver chegado
			if(window.ourComputer.processes[i].arriveTime <= tempo){
				//Se o processo ainda não foi concluido
				if( !(window.ourComputer.processes[i].cpuTime >= window.ourComputer.processes[i].duration && window.ourComputer.processes[i].segment == undefined) ){
					if(window.ourComputer.processes[i].segment){//Se o processo já tiver sido alocado
						window.ourComputer.processes[i].cpuTime++;
						//Se o processo já tiver passado seu tempo de duração na CPU
						if(window.ourComputer.processes[i].cpuTime >= window.ourComputer.processes[i].duration){
							window.ourComputer.deallocate(i);//Desaloca o processo
						}
					}
					else{
						if( !window.ourComputer.thereIsWaitingProcessBeforeThis(i) ){//Se não tiver nenhum processo esperando.
							var freeSegIndex;
							//procurar por segmento livre e que caiba o processo usando o criterio de alocação escolhido
							switch(window.ourComputer.allocationMethod){
								case "firstFit":
									freeSegIndex = window.ourComputer.firstFitFreeSegmentIndex(i);
									break;
								case "bestFit":
									freeSegIndex = window.ourComputer.bestFitFreeSegmentIndex(i);
									break;
								case "worstFit":
									freeSegIndex = window.ourComputer.worstFitFreeSegmentIndex(i);
									break;
								case "nextFit":
									freeSegIndex = window.ourComputer.nextFitFreeSegmentIndex(i);
									break;
								default:
									window.alert("Você definiu um método de alocação desconhecido.")
									break;
							}
							if(freeSegIndex != -1){//Se tiver espaço para o Processo
								window.ourComputer.allocate(i, freeSegIndex, window.tempo);
							}
						}
						else{
							//acho que aqui não precisa de nada aqui
						}
						// Como o processo ainda não foi alocado calcular o tempo de espera dele
						window.ourComputer.processes[i].waitingTime = window.tempo - window.ourComputer.processes[i].arriveTime;//calcula o tempo de espera do processo processo que foi alocado.
					}
				}
			}
			else{
				//console.log("seria bom parar o loop aqui se os processos nao poderem chegar ao mesmo tempo (minArrive = 0).");
				//break; //para o loop se não poder ter processos iniciando 0 segundos apos o anterior;
			}
		}
		
		window.drawProcessesTable(tblProcesses, ourComputer.processes);//desenha a tabela de processos
		window.drawComputerMemory(tblMemory, ourComputer);//desenha a tabela de memoria
		document.getElementById("timeDisplay").innerHTML = window.tempo;//mostra o tempo na página
		switch(window.ourComputer.allocationMethod){
				case "firstFit":
					document.getElementById("tmeFirstFit").innerHTML = window.ourComputer.processTME();//mostra o TME na página
					break;
				case "bestFit":
					document.getElementById("tmeBestFit").innerHTML = window.ourComputer.processTME();//mostra o TME na página
					break;
				case "worstFit":
					document.getElementById("tmeWorstFit").innerHTML = window.ourComputer.processTME();//mostra o TME na página
					break;
				case "nextFit":
					document.getElementById("tmeNextFit").innerHTML = window.ourComputer.processTME();//mostra o TME na página
					break;
				default:
					window.alert("Você definiu um método de alocação desconhecido.")
					break;
		}
		
		if(window.ourComputer.allProcessesHasConcluded()){
			window.clearTimeout(window.timeoutVar);
			window.tempo=-1;
			switch(window.ourComputer.allocationMethod){
				case "firstFit":
					console.log("terminou o First-Fit");
					window.ourComputer.renewProcesses();
					btnFirstFit.disabled = false;
					btnBestFit.disabled = false;
					btnWorstFit.disabled = false;
					btnNextFit.disabled = false;
					break;
				case "bestFit":
					console.log("terminou o Best-Fit");
					window.ourComputer.renewProcesses();
					btnFirstFit.disabled = false;
					btnBestFit.disabled = false;
					btnWorstFit.disabled = false;
					btnNextFit.disabled = false;
					break;
				case "worstFit":
					console.log("terminou o Worst-Fit");
					window.ourComputer.renewProcesses();
					btnFirstFit.disabled = false;
					btnBestFit.disabled = false;
					btnWorstFit.disabled = false;
					btnNextFit.disabled = false;
					break;
				case "nextFit":
					console.log("terminou o Next-Fit");
					window.ourComputer.renewProcesses();
					btnFirstFit.disabled = false;
					btnBestFit.disabled = false;
					btnWorstFit.disabled = false;
					btnNextFit.disabled = false;
					break;
				default:
					window.alert("Você definiu um método de alocação desconhecido.")
					break;
			}
		}
		
		window.tempo++;
		
	}
	
	btnFirstFit.onclick = function(){
		console.log("comecou o First-Fit");
		btnFirstFit.disabled = true;
		btnBestFit.disabled = true;
		btnWorstFit.disabled = true;
		btnNextFit.disabled = true;
		window.ourComputer.allocationMethod = "firstFit"
		window.timeoutVar = window.setInterval(allocationStep,window.ourComputer.cpuTickTime);
	}
	
	btnBestFit.onclick = function(){
		console.log("comecou o Birst-Fit");
		btnFirstFit.disabled = true;
		btnBestFit.disabled = true;
		btnWorstFit.disabled = true;
		btnNextFit.disabled = true;
		window.ourComputer.allocationMethod = "bestFit"
		window.timeoutVar = window.setInterval(allocationStep,window.ourComputer.cpuTickTime);
	}
	
	btnWorstFit.onclick = function(){
		console.log("comecou o Worst-Fit");
		btnFirstFit.disabled = true;
		btnBestFit.disabled = true;
		btnWorstFit.disabled = true;
		btnNextFit.disabled = true;
		window.ourComputer.allocationMethod = "worstFit"
		window.timeoutVar = window.setInterval(allocationStep,window.ourComputer.cpuTickTime);
	}
	
	btnNextFit.onclick = function(){
		console.log("comecou o Next-Fit");
		btnFirstFit.disabled = true;
		btnBestFit.disabled = true;
		btnWorstFit.disabled = true;
		btnNextFit.disabled = true;
		window.ourComputer.allocationMethod = "nextFit"
		window.timeoutVar = window.setInterval(allocationStep,window.ourComputer.cpuTickTime);
	}
	
}

function drawComputerMemory(table, computer){
	$('.memRow').remove();	
	for(var i = 0 ; i < computer.segmentList.length ; i++){
		var newLine;
		
		var coluna1 = $('<td>');
		coluna1.append(i);
		
		var coluna2 = $('<td>');
		coluna2.append(computer.segmentList[i].start);
		
		var coluna3 = $('<td>');
		coluna3.append(computer.segmentList[i].size);
		
		var coluna4 = $('<td>');
		
		switch(computer.segmentList[i].type){
			case "free":
				coluna4.append("free");
				newLine = $('<tr class="memRow userFrame success">');
				break;
			case "process":	
				coluna4.append(computer.segmentList[i].process.PID);
				newLine = $('<tr class="memRow userFrame info">');
				break;
			case "so":	
				coluna4.append("S.O.");
				newLine = $('<tr class="memRow soFrame danger">');
				break;
			default:
				window.alert("Algo deu errado na hora de desenhar a tabela.")
				break;
		}
		
		newLine.append(coluna1);
		newLine.append(coluna2);
		newLine.append(coluna3);
		newLine.append(coluna4);
		
		table.append(newLine);
	}
}

function drawProcessesTable(table, processes){
	$('.procRow').remove();
	for(i = 0 ; i < processes.length ; i++){
		var coluna1 = $('<td>');//PID do processo
		coluna1.append(processes[i].PID);
		
		var coluna2 = $('<td>');//Tamanho do processo
		coluna2.append(processes[i].size);
		
		var coluna3 = $('<td>');//Tempo de chegada
		coluna3.append(processes[i].arriveTime);
		
		var coluna4 = $('<td>');//Duracao do processo
		coluna4.append(processes[i].duration);
		
		var coluna5 = $('<td>');//Tempo de alocacao
		
		var coluna6 = $('<td>');//Tempo de CPU
		coluna6.append(processes[i].cpuTime);
		
		var coluna7 = $('<td>');//Status do processo
		
		var newLine;
		
		if(window.tempo < processes[i].arriveTime){//se o processo ainda nao tiver chegado
			coluna5.append("-")
			coluna7.append("chegando");
			newLine = $('<tr class="procRow">');
		}
		else{
			if(processes[i].cpuTime < processes[i].duration){
				if(processes[i].segment){
					coluna5.append(processes[i].arriveTime +  processes[i].waitingTime);
					coluna7.append("alocado");
					newLine = $('<tr class="procRow info">');
				}
				else{
					coluna5.append("-")
					coluna7.append("esperando");
					newLine = $('<tr class="procRow danger">');
				}
			}
			else{
				coluna5.append(processes[i].arriveTime +  processes[i].waitingTime);
				coluna7.append("concluido");
				newLine = $('<tr class="procRow success">');
			}
		}
		
		newLine.append(coluna1);
		newLine.append(coluna2);
		newLine.append(coluna3);
		newLine.append(coluna4);
		newLine.append(coluna5);
		newLine.append(coluna6);
		newLine.append(coluna7);
		
		table.append(newLine);
	}
}
