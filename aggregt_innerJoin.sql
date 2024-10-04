
drop table if exists binar.akun;

create table binar.akun (
	id int generated by default as identity,
	nama varchar(100) not null,
	saldo dec(15,2) not null,
	primary key(id)
);

insert into binar.akun(nama, saldo)
values('Andi', 1000000);
insert into binar.akun(nama, saldo)
values('Budi', 2000000);

select * from binar.akun;

create or replace procedure binar.transfer(
	pengirim int,
	penerima int,
	nominal dec
)
language plpgsql
as $$
begin
	update binar.akun
	set saldo = saldo-nominal
	where id= pengirim;
	
	update binar.akun
	set saldo = saldo + nominal
	where id= penerima;
	
	commit;
end;$$

call binar.transfer(1,2,250000);


drop table if exists binar.penjualan;

create table binar.penjualan (
	id int generated by default as identity,
	product varchar(255) not null,
	amount dec(15,2) not null,
	salesDate timestamp not null,
	primary key(id)
);

insert into binar.penjualan(product,amount,salesDate)
values
('hp1',100,NOW()),
('hp2', 150, NOW()),
('hp1', 200, NOW()),
('hp3', 250, NOW()),
('hp2', 300, NOW()),
('hp1', 175, NOW());

// mau cari tau untuk penjualan untuk masing masing produk
select product,sum(amount)
from binar.penjualan
group by product;

//jika diurutkan
select product,sum(amount) as "jumlah"
from binar.penjualan 
group by product
order by product;


//make rata rata
select product,AVG(amount) as "rata rata"
from binar.penjualan 
group by product
order by product;


/*mau cari tau produk >400 */
select product, sum(amount) "Total penjualan"
from binar.penjualan
group by product
/*menggunakan having karena angegat function selain itu pakai where */
having sum(amount) > 400;

select * from binar.penjualan;


/*agregat functio (min(),max(),sum(),)*/

CREATE OR REPLACE PROCEDURE binar.transfer(
    pengirim INT,
    penerima INT,
    nominal DEC
)
LANGUAGE plpgsql
AS $$
DECLARE
    current_saldo DECIMAL;
BEGIN
    -- Check current saldo of the sender
    SELECT saldo INTO current_saldo
    FROM binar.akun
    WHERE id = pengirim;

    -- Ensure the account exists
    IF current_saldo IS NULL THEN
        RAISE EXCEPTION 'Pengirim account with ID % does not exist', pengirim;
    END IF;

    -- Check if there are sufficient funds
    IF current_saldo < nominal THEN
        RAISE EXCEPTION 'Insufficient funds. Current saldo: %, Transfer amount: %', current_saldo, nominal;
    END IF;

    -- Deduct from sender
    UPDATE binar.akun
    SET saldo = saldo - nominal
    WHERE id = pengirim;

    -- Add to receiver
    UPDATE binar.akun
    SET saldo = saldo + nominal
    WHERE id = penerima;

    -- Commit transaction (optional in PL/pgSQL since it is automatically handled)
    -- COMMIT; -- Uncomment if needed, usually not required in PL/pgSQL

    RAISE NOTICE 'Transfer of % from account % to account % successful', nominal, pengirim, penerima;
END;
$$;



/* inner join,left join,outer join*/
create table binar.customer (
	id int generated by default as identity,
	nama varchar(255) not null,
	primary key(id)
);
create table binar.orders (
    id int generated by default as identity,
	nama varchar(255),
    CustomerID int,
    OrderDate timestamp,
	primary key(id),
    foreign key (CustomerID) references binar.customer(id)
);

insert into binar.customer (nama)
values ('andi'), ('budi'), ('dani'), ('Erik');

insert into binar.orders (nama, CustomerId, OrderDate)
values ('KFC',1,now()), ('sikat gigi',3,now()), ('odol',4,now());


//nambahin valu e di ven orders
insert into binar.orders (nama, CustomerId)
values ('sabun',null);


select * from binar.customer;
select * from binar.orders;

/*inner join sama aja join biasa*/
select c.*, o.*
from binar.customer c
join binar.orders o
on c.id = o.CustomerID

/* left join */

select c.*, o.*
from binar.customer c
left join binar.orders o
on c.id = o.CustomerID


/* right join */
select c.*, o.*
from binar.customer c
right join binar.orders o
on c.id = o.CustomerID

/* full join */
//dipindah posisi juga
select o.*, c.*
from binar.orders o
full join binar.customer c
on c.id = o.CustomerID
order by c.id;