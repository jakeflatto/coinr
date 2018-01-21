import os
from os.path import join, dirname
from dotenv import load_dotenv
import datetime
from coin_ticker import CoinTicker
from sqlalchemy import create_engine
import psycopg2
import pandas as pd

dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)

class CoinServicePG:

	def get_pg_password():
		value =  os.environ.get('POSTGRES_PASSWORD')
		if value is None:
			raise "Must provide POSTGRES_PASSWORD"
		return value

	def get_pg_username():
		value =  os.environ.get('POSTGRES_USERNAME')
		if value is None:
			raise "Must provide POSTGRES_USERNAME"
		return value

	def get_pg_host():
		value =  os.environ.get('POSTGRES_HOST')
		if value is None:
			raise "Must provide POSTGRES_HOST"
		return value

	def get_pg_db():
		value =  os.environ.get('POSTGRES_DB')
		if value is None:
			raise "Must provide POSTGRES_DB"
		return value

	def get_pg_engine(connection_string_dict):
		username = connection_string_dict['username']
		password = connection_string_dict['password']
		host = connection_string_dict['host']
		db = connection_string_dict['db']
		port = '5432'

		if username is None or password is None or host is None or db is None:
			raise "Must provide the following:\n\tUsername\n\t \
					Password\n\tHost\n\tDB"

		connection_string = 'postgresql://{}:{}@{}:{}/{}'.format(username,password,host,port,db)

		return create_engine(connection_string)

	# def get_coin_data(self,ticker_symbol):
	@classmethod
	def get_coin_data(cls,ticker_symbol,traded_with,start_date=datetime.datetime.now().date()-datetime.timedelta(days=1),end_date=datetime.datetime.now().date()):
		pg_password = cls.get_pg_password()
		pg_username = cls.get_pg_username()
		pg_host = cls.get_pg_host()
		pg_db = cls.get_pg_db()

		connection_dict = {}
		connection_dict['username'] = pg_username
		connection_dict['password'] = pg_password
		connection_dict['host'] = pg_host
		connection_dict['db'] = pg_db

		pg_engine = cls.get_pg_engine(connection_dict)
		
		query = 'SELECT * FROM price_histories_hourly WHERE exchange=\'{}\' AND traded_for=\'{}\' AND traded_with=\'{}\' AND hour_marker BETWEEN \'{}\' AND \'{} 23:00\';'.format('CCCAGG',ticker_symbol,traded_with,start_date,end_date)
		
		query_results = pd.read_sql_query(query,con=pg_engine,index_col='hour_marker')

		return query_results

		# if error
		# else:
		# 	dataset = response_dict['dataset']
		# 	coin_ticker_dict = {}
		# 	coin_ticker_dict['ticker'] = ticker_symbol
		# 	coin_ticker_dict['name'] = dataset['name']
		# 	coin_ticker_dict['description'] = dataset['description']
		# 	coin_ticker_dict['max_date'] = datetime.strptime(dataset['newest_available_date'],'%Y-%m-%d')
		# 	coin_ticker_dict['min_date'] = datetime.strptime(dataset['oldest_available_date'],'%Y-%m-%d')
		# 	coin_ticker_dict['data_columns'] = dataset['column_names']
		# 	coin_ticker_dict['data'] = dataset['data']
		# 	coin_ticker = CoinTicker()
		# 	coin_ticker.populate(coin_ticker_dict)
		# 	return coin_ticker

			# return a new coin_ticker instance populated with response data
# print(CoinServicePG.get_coin_data('ADA','BTC','2018-01-01','2018-01-02').head())
