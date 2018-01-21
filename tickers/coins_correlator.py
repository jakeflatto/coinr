import sys
import pandas as pd
import numpy as np
import coin_ticker
import datetime
from coin_service import CoinServicePG 

"""
Takes in a list of coins, a number of days, a metric, and a boolean indicating whether to do a pct_change() transformation
Also takes an optional start date - if no start date is given, start date is determined automatically by the number of days ()
"""

def get_coins_correlation(coins_list,traded_with,number_of_days,metric,percent_change_bool,end_date=None):
	number_of_coins = len(coins_list)

	# Convert the end_date and number_of_days argument into a start date and end date
	if end_date==None:
		now = datetime.datetime.now()
	else:
		now = datetime.datetime.strptime(end_date,'%Y-%m-%d')
		
	then = now - datetime.timedelta(days=number_of_days)

	first_date = datetime.datetime.strftime(then,'%Y-%m-%d')
	last_date = datetime.datetime.strftime(now,'%Y-%m-%d')

	# Create placeholder arrays to add to while looping through coins
	dfs_to_combine = []
	combined_df_keys = []

	# Loop thru list of coins and extract the relevant data
	for i in range(0,number_of_coins):
		# Grab ticker symbol
		ticker_symbol_i = coins_list[i]

		# Get ticker data from coinr PG db
		ticker_i_df = CoinServicePG.get_coin_data(ticker_symbol_i,traded_with,first_date,last_date)		

		# Convert the metric in question from strings to floats
		ticker_i_df[metric] = ticker_i_df[metric].apply(lambda value: float(value))

		# Add to arrays we will use to construct a combined df with pd.concat
		dfs_to_combine.append(ticker_i_df[metric])
		combined_df_keys.append(ticker_symbol_i)

	combined_df = pd.concat(dfs_to_combine, axis=1, keys = combined_df_keys)

	# Drop any rows where we cannot match dates
	final_data = combined_df.dropna(how='any')

	# Deal with the percent_change_bool value
	if percent_change_bool:
		for col in final_data.columns.values.tolist():
			final_data[col] = (final_data[col]-final_data[col][0]) / final_data[col][0] * 100.0
	
	# print(final_data)

	return final_data.corr()

# print(get_coins_correlation(['XRP','ADA','ETH','IOT'],'BTC',30,"close",False))