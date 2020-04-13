import plotly.figure_factory as ff
import plotly.graph_objects as go
import numpy as np
import pandas as pd
from urllib import urlopen
import json
import sys
import math

maptype = sys.argv[1] if len(sys.argv) == 2 else 'all'
print(maptype)
print('------')
path = '../covid-19-visualization/src/Figures'
def write_county_map():
    counties = json.load(urlopen('https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json'))
    print('Got counties')
    df = pd.read_csv('https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv', dtype={"fips": str})
    print(df)
    maxLog = math.log10(np.max(df['cases']))

    import plotly_express as px
    print('CSV read. Creating figure.')
    fig = px.choropleth(df, geojson=counties, locations="fips", color=np.log10(df["cases"]), color_continuous_scale='Inferno', range_color=(0, maxLog), scope="usa", animation_frame='date',
                     labels={'cases': 'cases'}, hover_data=['cases'], hover_name='county', title='United States COVID-19 Confirmed Cases by County')
    print('figure created, writing data...')
    fig.write_json(path + '/counties.json')
    print('figure json data written')
    fig.write_html(path + '/counties.html')
    print('figure html data written')

def write_states_map():
    df = pd.read_csv('https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv', dtype={"fips": str})
    import us
    mapping = us.states.mapping('name', 'abbr')
    maxLog = math.log10(np.max(df['cases']))
    import plotly_express as px
    print('CSV read. Creating figure.')
    fig = px.choropleth(df, locationmode='USA-states', locations=[mapping[entry[1]] for entry in df.values], color=np.log10(df["cases"]), color_continuous_scale='Inferno', range_color=(1.5, maxLog), scope="usa", animation_frame='date',
                     labels={'cases': 'cases'}, hover_data=['cases'], hover_name='state', title='United States Statewide COVID-19 Confirmed Cases')
    print('figure created')
    fig.write_json(path + '/states.json')
    fig.write_html(path + '/states.html')

def write_global_map():
    df = pd.read_csv('https://raw.githubusercontent.com/datasets/covid-19/master/data/countries-aggregated.csv')
    print(np.max(df['Confirmed']))
    maxLog = math.log10(np.max(df['Confirmed']))
    import plotly_express as px
    print('CSV read. Creating figure.')
    fig = px.choropleth(df, locationmode='country names', locations='Country', color=np.log10(df["Confirmed"]), color_continuous_scale='Inferno', range_color=(1, maxLog), scope="world", animation_frame='Date',
                     labels={'Confirmed': 'Confirmed'}, hover_data=['Confirmed'], hover_name='Country', title='Global COVID-19 Confirmed Cases')
    print('figure created')
    fig.write_json(path + '/countries.json')
    fig.write_html(path + '/countries.html')


if maptype == 'counties':
    write_county_map()
elif maptype == 'states':
    write_states_map()
elif maptype == 'countries':
    write_global_map()
elif maptype== 'all':
    write_county_map()
    write_states_map()
    write_global_map()