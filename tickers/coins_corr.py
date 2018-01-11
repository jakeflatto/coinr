import sys
import pandas as pd
import numpy as np
import coin_ticker
import argparse
import datetime
from coin_service import CoinServicePG 

"""
	This is a command line util for comparing two coin_ticker instances
"""

parser = argparse.ArgumentParser()
parser.add_argument("coins",help="list of coin tickers to compare")
parser.add_argument("-d","--days", help="compare coins over this many previous days",default=365,type=int)
parser.add_argument("-m","--metric",help="metric for which to compare coins",default="close",choices=['open', 'high', 'low', 'close', 'volume_traded_with', 'volume_traded_for'])
parser.add_argument("-w","--traded_with",help="coin that prices are listed in terms of - traded with this coin",default="BTC",type=str)
parser.add_argument("-p","--percent",help="apply a percent_change_from_beginning transformation to the data",action="store_true")
args=parser.parse_args()

coins = args.coins.split()
number_of_coins = len(coins)

# Convert the days argument into a start date and end date
now=datetime.datetime.now()
then=now-datetime.timedelta(days=args.days)

first_date = datetime.datetime.strftime(then,'%Y-%m-%d')
last_date = datetime.datetime.strftime(now,'%Y-%m-%d')

# The metric for which we will measure correlation between different coin tickers
metric = args.metric

# Create placeholder arrays to add to while looping through coins
dfs_to_combine = []
combined_df_keys = []

# Loop thru list of coins and extract the relevant data
for i in range(0,number_of_coins):
	# Grab ticker symbol
	coin_i = coins[i]

	ticker_i_df = CoinServicePG.get_coin_data(coin_i,args.traded_with)
	
	# Convert the metric in question from strings to floats
	# ticker_i_df[metric] = ticker_i_df[metric].apply(lambda value: float(value))

	# Add to arrays we will use to construct a combined df with pd.concat
	dfs_to_combine.append(ticker_i_df[metric])
	combined_df_keys.append(coin_i)

combined_df = pd.concat(dfs_to_combine, axis=1, keys = combined_df_keys)

# Drop any rows where we cannot match dates
combined_df.dropna(how='any',inplace=True)

# Filter based on user-entered days parameter	
final_data = combined_df.ix[first_date:last_date]

output_message = "\"{}\" data over the last {} days".format(args.metric,args.days)

# Deal with the percent_change_bool value
if args.percent:
	output_message = "Growth in " + output_message
	for col in final_data.columns.values.tolist():
		final_data[col] = (final_data[col]-final_data[col][0]) / final_data[col][0] * 100.0

print(final_data)
print(final_data.corr())

print(output_message)