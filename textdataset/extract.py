from pathlib import Path
from os import chdir
import pandas as pd

def ods_to_txt(ods_file, txt_file):
    try:
                    
        # Read ODS file using pandas
        df = pd.read_excel(ods_file, engine='odf')
        # Save DataFrame to a text file (CSV format)
        df.to_csv(txt_file, index=False, header=True, sep='\t')
        
        print(f"Successfully converted '{ods_file}' to '{txt_file}'.")
    except Exception as e:
        print(f"Error: {e}")


chdir('textdataset')
print(Path.cwd())


input_ods_file = '01.ods'
output_txt_file = 'data.txt'
ods_to_txt(input_ods_file, output_txt_file)
