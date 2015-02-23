import sys
import argparse
import json

class IPImporter(object):
    @staticmethod
    def load(path):
        """
        Factory: Returns an importer object loaded
        """
        content = open(path).read()
        return IPImporter(content)

    @staticmethod
    def process_line(line):
        """
        Process a single line, returning a dict representing values
        """
        parts = line.split()
        result = {
            'name': parts[1],
#            'namespace': parts[0][0:parts[0].rfind('.')],
            'namespace': parts[0],
            'metrics': {
                "atfd": int(parts[2]),
                "loc": float(parts[5]),
                "tcc": float(parts[4]),
                "wmc": int(parts[3])
            }
        }
        return result

    def __init__(self, in_content):
        self.in_content = in_content
        self.in_lines = in_content.split('\n')
        self.result = None

    def process(self):
        """
        Process the input and generate a self.result
        """
        result = []
        for line in self.in_lines:
            result.append(self.process_line(line))
        self.result = result

    def save_to(self, path, varname):
        dump = json.dumps(self.result, sort_keys=True,
            indent=4, separators=(',', ': '))
        file = open(path, 'w')
        file.write(varname + ' = '+dump)
        file.flush()
        file.close()

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Importer from iplasma.')
    parser.add_argument('-in', '--input-file', help='Input file.', required=True)
    parser.add_argument('-out', '--output-file', help='Output file.', required=True)
    parser.add_argument('-var', '--variable', help='Variable name.', required=True)
    args = parser.parse_args()
    importer = IPImporter.load(args.input_file)
    importer.process()
    importer.save_to(args.output_file, args.variable)

