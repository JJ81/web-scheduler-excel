// (function ($) {
	
	var table = $('.table');
	var tmp_storage = [];

	// table.delegate('td', 'dblclick', function () {
	// 	var _self = $(this);
	// 	console.log('dbl click');
	// 	table.find('td').attr('contenteditable', 'false');
	// 	_self.attr('contenteditable', 'true');
	// });


	$('.table').bind('click', function (e) {
		e.stopPropagation();
	});

	$(document).bind('click', function () {
		console.log('do something');
		cancelSelected('모든 선택 해제!');
	});


	/**
	 * 테이블의 셀선택 이벤트 관련
	 */
	table.delegate('td', 'click', function () {
		var _self = $(this);
		
		if(_self.hasClass('selected')){
			_self.removeClass('selected');
			// TODO 동일한 것을 다시 선택할 경우 해당 배열을 제거해야 한다.
			cancelSelected('시작영역을 다시 선택하세요.');
			return;
		}else{
			_self.addClass('selected');
		}

		var row = _self.parent().index();
		var column = _self.index();

		console.log('row : ' + row + ' / column : ' + column);

		if(tmp_storage.length === 0){
			console.log('first push data');

			if(_self.attr('rowspan') > 1){
				console.log('병합된 셀을 첫번째로 선택하는 경우');
				var i=row, size=parseInt(_self.attr('rowspan')) + parseInt(row);

				for(;i<size;i++){
					tmp_storage.push({
						c: column,
						r: i
					});	
				}
			}else{
				tmp_storage.push({
					c: column,
					r: row
				});	
			}

			return;
		}

		if(tmp_storage[tmp_storage.length-1].c !== column){
			cancelSelected('동일한 칼럼에서만 지정할 수 있습니다.');
			return;
		}

		// 병합된 셀을 선택하게 될 경우 실제 그 병합된 셀을 모두 선택한 것처럼 배열에 해당 값을 넣을 수 있도록 한다.
		if(_self.attr('rowspan') > 1){
			console.log('병합된 셀이 : ' +  _self.attr('rowspan'));

			// 상단의 코드와 중복되는 지점
			console.log('두번째로 선택된 셀이 병합된 셀일 경우');
			console.log('row ' + row);

			var i=row, size=parseInt(_self.attr('rowspan')) + parseInt(row);

			for(;i<size;i++){
				tmp_storage.push({
					c: column,
					r: i
				});	
			}

		}else{
			console.log('하나의 셀');

			tmp_storage.push({
				c: column,
				r: row
			});
		}


		if(tmp_storage.length > 1){
			console.log(tmp_storage[tmp_storage.length-1].r)
			console.log('current : ' + row);
			console.log( Math.abs(tmp_storage[tmp_storage.length-1].r - row) );	
		}
		

		var tmp_single_row = [];
		for(var i=0,size=tmp_storage.length;i<size;i++){
			tmp_single_row.push(tmp_storage[i].r);
		}

		tmp_single_row = tmp_single_row.sort();

		console.log('총 선택된 영역이 중간이 빠진 것이 없는지 확인하기 위해서');
		console.log(tmp_single_row);
		
		var tmp_selected_value = null;
		for(var i=0,size=tmp_single_row.length;i<size;i++){
			if(tmp_selected_value == null){
				tmp_selected_value = tmp_single_row[i];
			}

			if(Math.abs(tmp_single_row[i] - tmp_selected_value) > 1){
				console.log('순차적이지 않으므로 모두 해제!!');
				 cancelSelected('선택된 영역이 잘못되었습니다.');
				return;
			}
			tmp_selected_value = tmp_single_row[i];
		}

		
		console.log(column + ' / ' + row);

	});

	/**
	 * 선택된 영역을 해제
	 * @param {*} msg 
	 */
	function cancelSelected(msg){
		table.find('td').removeClass('selected');
		tmp_storage = [];
		console.log(msg);
	}

	/**
	 * 기본에 이미 병합된 셀을 다시 분리
	 * @param {*} msg 
	 */
	function restoreCell(msg){
		// 배열에 저장된 위치의 각 셀에서 rowspan과 blind class를 모두 제거한다.
		for(var i=0,size=tmp_storage.length;i<size;i++){
			console.log('c : ' + tmp_storage[i].c + ' / r : ' + tmp_storage[i].r);
			table.find('tr').eq(tmp_storage[i].r).children('td').eq(tmp_storage[i].c).attr({'rowspan' :  '1'}).removeClass('blind');
		}

		cancelSelected('병합된 셀을 해제 후 선택 해제');

		console.log(msg);
	}

	/**
	 * 선택된 셀을 병합
	 * @param {*} msg 
	 */
	function mergeSelected(msg){
		if(tmp_storage.length <= 1){
			alert('병합할 영역을 하나 이상 선택하세요.');
			return;
		}

		
		var tmp_min = null, arr_pos = null;

		for(var i=0,size=tmp_storage.length;i<size;i++){
			if(tmp_min == null){
				tmp_min = tmp_storage[i].r;
			}

			if(tmp_storage[i].r <= tmp_min){
				tmp_min = tmp_storage[i].r;
				arr_pos = i;
			}
		}
		
		console.log('min row ' + tmp_min);
		console.log('arr pos ' + arr_pos);

		for(var i=0,size=tmp_storage.length;i<size;i++){
			if(i === arr_pos){
				console.log( 'start column ' + tmp_storage[i].c );
				console.log( 'start row ' + tmp_storage[i].r );

				table.find('tr').eq(tmp_storage[i].r).children('td').eq(tmp_storage[i].c).attr('rowspan', tmp_storage.length);
			}else{
				console.log( 'blind column ' + tmp_storage[i].c );
				console.log( 'blind row ' + tmp_storage[i].r );
				table.find('tr').eq(tmp_storage[i].r).children('td').eq(tmp_storage[i].c).addClass('blind');
			}
		}


		table.find('td').removeClass('selected');
		tmp_storage = [];

		console.log(msg);
	}

	/**
	 * 선택된 영역에 메모를 추가한다.
	 * @param {*} msg 
	 */
	function insertMemo(msg){
		// 하나의 선택영역에서만 메모가 가능하다
		// 복수의 선택영역이 있을 경우 선택 영역을 모두 해제한다.
		// 선택된 영역을 contenteditable="true"로 변환한다.
		// blur 이벤트가 일어나거나 메모종료 버튼을 누를 경우 수정 모드가 종료되는 것으로 설정할 수 있겠다. 

		table.find('td').attr('contenteditable', 'false');
		table.find('.selected').attr('contenteditable', 'true').focus();

		table.find('.selected').blur(function () {
			console.log('blur');
			table.find('td').attr('contenteditable', 'false');
			table.find('td').removeClass('selected');
		});

		console.log(msg);
	}


	$('.js-btn-merge').bind('click', function () {
		mergeSelected('병합되었습니다.');
	});

	$('.js-btn-cancel').bind('click', function () {
		cancelSelected('선택영역이 취소되었습니다.');
	});

	$('.js-btn-redo-merge').bind('click', function () {
		// 선택영역이 있는지 확인하고 
		// 두개 이상 선택된 셀이 있다면 모두 선택 해제 한다.
		if(table.find('.selected').length>1){
			cancelSelected('병합취소는 하나의 선택영역에서만 가능합니다.');
			return;
		}

		if(!table.find('.selected').attr('rowspan')){
			cancelSelected('선택한 영역은 병합된 셀이 아닙니다.');
			return;
		}

		if(table.find('.selected').attr('rowspan') <= 1){
			cancelSelected('선택한 영역은 병합된 셀이 아닙니다.');
			return;
		}

		console.log( table.find('.selected').attr('rowspan') );

		restoreCell('병합된 셀이 분리되었습니다.');
	});


	$('.js-btn-write').bind('click', function () {
		if(table.find('.selected').length<1){
			console.log('메모할 셀을 선택해주세요.');
			return;
		}

		insertMemo('쓰기 모드');
	});
	

//}(jQuery));