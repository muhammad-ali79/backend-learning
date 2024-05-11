- A correct MongoDB ObjectID has a specific format and structure:

Format:

It's a 12-byte binary value represented as a 24-character hexadecimal string (base 16).
The string consists of characters from 0-9 and a-f (case-insensitive).
Structure (Internal - Not directly checked by isValidObjectId):

The 12 bytes are further divided into three components:
4 Bytes: Timestamp (seconds since the Unix epoch)
5 Bytes: Random value unique to the machine and process that generated the ID
3 Bytes: Incrementing counter, initialized to a random value

- Think "Simple task = Simple query" and "Complex task = Aggregation pipeline".

- Atomic Update=> if a document exists with a certain condition return it. if not create a document on the same collection

- mongoose .populate can be used to directly get the data of the refrence ids without using any aggregations or find queries
