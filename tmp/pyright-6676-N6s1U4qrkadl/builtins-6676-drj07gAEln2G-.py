# Python: 3.10.12 (main, Feb  4 2025, 14:57:36) [GCC 11.4.0]
# Library: builtins, version: unspecified
# Module: builtins, version: unspecified

"Built-in functions, exceptions, and other objects.\n\nNoteworthy: None is the `nil' object; Ellipsis represents `...' in slices."

import typing
class ellipsis(object):
    def __getattribute__(self, name) -> typing.Any:
        'Return getattr(self, name).'
        ...
    
    def __init__(self, *args, **kwargs) -> None:
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    def __reduce__(self) -> typing.Union[str, typing.Tuple[typing.Any, ...]]:
        ...
    
    def __repr__(self) -> str:
        'Return repr(self).'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class NotImplementedType(object):
    def __bool__(self) -> bool:
        'True if self else False'
        ...
    
    def __init__(self, *args, **kwargs) -> None:
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    def __reduce__(self) -> typing.Union[str, typing.Tuple[typing.Any, ...]]:
        ...
    
    def __repr__(self) -> str:
        'Return repr(self).'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class ArithmeticError(Exception):
    'Base class for arithmetic errors.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Base class for arithmetic errors.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class AssertionError(Exception):
    'Assertion failed.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Assertion failed.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class AttributeError(Exception):
    'Attribute not found.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Attribute not found.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    def __str__(self) -> str:
        'Return str(self).'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    @property
    def name(self) -> typing.Any:
        'attribute name'
        ...
    
    @property
    def obj(self) -> typing.Any:
        'object'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class BaseException(object):
    'Common base class for all exceptions'
    @property
    def __cause__(self) -> typing.Any:
        'exception cause'
        ...
    
    @property
    def __context__(self) -> typing.Any:
        'exception context'
        ...
    
    def __delattr__(self, name) -> None:
        'Implement delattr(self, name).'
        ...
    
    __dict__: typing.Dict[str, typing.Any]
    def __getattribute__(self, name) -> typing.Any:
        'Return getattr(self, name).'
        ...
    
    def __init__(self, *args, **kwargs) -> None:
        'Common base class for all exceptions'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    def __reduce__(self) -> typing.Union[str, typing.Tuple[typing.Any, ...]]:
        ...
    
    def __repr__(self) -> str:
        'Return repr(self).'
        ...
    
    def __setattr__(self, name, value) -> None:
        'Implement setattr(self, name, value).'
        ...
    
    def __setstate__(self, state: typing.Any) -> None:
        ...
    
    def __str__(self) -> str:
        'Return str(self).'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    @property
    def __suppress_context__(self) -> typing.Any:
        ...
    
    @property
    def __traceback__(self) -> typing.Any:
        ...
    
    @property
    def args(self) -> typing.Any:
        ...
    
    def with_traceback(self, tb) -> typing.Any:
        'Exception.with_traceback(tb) --\n    set self.__traceback__ to tb and return self.'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class BlockingIOError(OSError):
    'I/O operation would block.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'I/O operation would block.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class BrokenPipeError(ConnectionError):
    'Broken pipe.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Broken pipe.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class BufferError(Exception):
    'Buffer error.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Buffer error.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class BytesWarning(Warning):
    'Base class for warnings about bytes and buffer related problems, mostly\nrelated to conversion from str or comparing to str.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Base class for warnings about bytes and buffer related problems, mostly\nrelated to conversion from str or comparing to str.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class ChildProcessError(OSError):
    'Child process error.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Child process error.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class ConnectionAbortedError(ConnectionError):
    'Connection aborted.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Connection aborted.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class ConnectionError(OSError):
    'Connection error.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Connection error.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class ConnectionRefusedError(ConnectionError):
    'Connection refused.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Connection refused.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class ConnectionResetError(ConnectionError):
    'Connection reset.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Connection reset.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class DeprecationWarning(Warning):
    'Base class for warnings about deprecated features.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Base class for warnings about deprecated features.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class EOFError(Exception):
    'Read beyond end of file.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Read beyond end of file.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

Ellipsis: ellipsis
class EncodingWarning(Warning):
    'Base class for warnings about encodings.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Base class for warnings about encodings.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

EnvironmentError: OSError
class Exception(BaseException):
    'Common base class for all non-exit exceptions.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Common base class for all non-exit exceptions.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class FileExistsError(OSError):
    'File already exists.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'File already exists.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class FileNotFoundError(OSError):
    'File not found.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'File not found.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class FloatingPointError(ArithmeticError):
    'Floating point operation failed.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Floating point operation failed.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class FutureWarning(Warning):
    'Base class for warnings about constructs that will change semantically\nin the future.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Base class for warnings about constructs that will change semantically\nin the future.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class GeneratorExit(BaseException):
    'Request that a generator exit.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Request that a generator exit.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

IOError: OSError
class ImportError(Exception):
    "Import can't find module, or can't find name in module."
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        "Import can't find module, or can't find name in module."
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    def __reduce__(self) -> typing.Union[str, typing.Tuple[typing.Any, ...]]:
        ...
    
    def __str__(self) -> str:
        'Return str(self).'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    @property
    def msg(self) -> typing.Any:
        'exception message'
        ...
    
    @property
    def name(self) -> typing.Any:
        'module name'
        ...
    
    @property
    def path(self) -> typing.Any:
        'module path'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class ImportWarning(Warning):
    'Base class for warnings about probable mistakes in module imports'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Base class for warnings about probable mistakes in module imports'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class IndentationError(SyntaxError):
    'Improper indentation.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Improper indentation.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class IndexError(LookupError):
    'Sequence index out of range.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Sequence index out of range.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class InterruptedError(OSError):
    'Interrupted by signal.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Interrupted by signal.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class IsADirectoryError(OSError):
    "Operation doesn't work on directories."
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        "Operation doesn't work on directories."
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class KeyError(LookupError):
    'Mapping key not found.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Mapping key not found.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    def __str__(self) -> str:
        'Return str(self).'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class KeyboardInterrupt(BaseException):
    'Program interrupted by user.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Program interrupted by user.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class LookupError(Exception):
    'Base class for lookup errors.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Base class for lookup errors.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class MemoryError(Exception):
    'Out of memory.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Out of memory.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class ModuleNotFoundError(ImportError):
    'Module not found.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Module not found.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class NameError(Exception):
    'Name not found globally.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Name not found globally.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    def __str__(self) -> str:
        'Return str(self).'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    @property
    def name(self) -> typing.Any:
        'name'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class NotADirectoryError(OSError):
    'Operation only works on directories.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Operation only works on directories.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

NotImplemented: NotImplementedType
class NotImplementedError(RuntimeError):
    "Method or function hasn't been implemented yet."
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        "Method or function hasn't been implemented yet."
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class OSError(Exception):
    'Base class for I/O related errors.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Base class for I/O related errors.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    def __reduce__(self) -> typing.Union[str, typing.Tuple[typing.Any, ...]]:
        ...
    
    def __str__(self) -> str:
        'Return str(self).'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    @property
    def characters_written(self) -> typing.Any:
        ...
    
    @property
    def errno(self) -> typing.Any:
        'POSIX exception code'
        ...
    
    @property
    def filename(self) -> typing.Any:
        'exception filename'
        ...
    
    @property
    def filename2(self) -> typing.Any:
        'second exception filename'
        ...
    
    @property
    def strerror(self) -> typing.Any:
        'exception strerror'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class OverflowError(ArithmeticError):
    'Result too large to be represented.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Result too large to be represented.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class PendingDeprecationWarning(Warning):
    'Base class for warnings about features which will be deprecated\nin the future.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Base class for warnings about features which will be deprecated\nin the future.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class PermissionError(OSError):
    'Not enough permissions.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Not enough permissions.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class ProcessLookupError(OSError):
    'Process not found.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Process not found.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class RecursionError(RuntimeError):
    'Recursion limit exceeded.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Recursion limit exceeded.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class ReferenceError(Exception):
    'Weak ref proxy used after referent went away.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Weak ref proxy used after referent went away.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class ResourceWarning(Warning):
    'Base class for warnings about resource usage.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Base class for warnings about resource usage.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class RuntimeError(Exception):
    'Unspecified run-time error.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Unspecified run-time error.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class RuntimeWarning(Warning):
    'Base class for warnings about dubious runtime behavior.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Base class for warnings about dubious runtime behavior.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class StopAsyncIteration(Exception):
    'Signal the end from iterator.__anext__().'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Signal the end from iterator.__anext__().'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class StopIteration(Exception):
    'Signal the end from iterator.__next__().'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Signal the end from iterator.__next__().'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    @property
    def value(self) -> typing.Any:
        'generator return value'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class SyntaxError(Exception):
    'Invalid syntax.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Invalid syntax.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    def __str__(self) -> str:
        'Return str(self).'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    @property
    def end_lineno(self) -> typing.Any:
        'exception end lineno'
        ...
    
    @property
    def end_offset(self) -> typing.Any:
        'exception end offset'
        ...
    
    @property
    def filename(self) -> typing.Any:
        'exception filename'
        ...
    
    @property
    def lineno(self) -> typing.Any:
        'exception lineno'
        ...
    
    @property
    def msg(self) -> typing.Any:
        'exception msg'
        ...
    
    @property
    def offset(self) -> typing.Any:
        'exception offset'
        ...
    
    @property
    def print_file_and_line(self) -> typing.Any:
        'exception print_file_and_line'
        ...
    
    @property
    def text(self) -> typing.Any:
        'exception text'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class SyntaxWarning(Warning):
    'Base class for warnings about dubious syntax.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Base class for warnings about dubious syntax.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class SystemError(Exception):
    'Internal error in the Python interpreter.\n\nPlease report this to the Python maintainer, along with the traceback,\nthe Python version, and the hardware/OS platform and version.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Internal error in the Python interpreter.\n\nPlease report this to the Python maintainer, along with the traceback,\nthe Python version, and the hardware/OS platform and version.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class SystemExit(BaseException):
    'Request to exit from the interpreter.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Request to exit from the interpreter.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    @property
    def code(self) -> typing.Any:
        'exception code'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class TabError(IndentationError):
    'Improper mixture of spaces and tabs.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Improper mixture of spaces and tabs.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class TimeoutError(OSError):
    'Timeout expired.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Timeout expired.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class TypeError(Exception):
    'Inappropriate argument type.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Inappropriate argument type.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class UnboundLocalError(NameError):
    'Local name referenced but not bound to a value.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Local name referenced but not bound to a value.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class UnicodeDecodeError(UnicodeError):
    'Unicode decoding error.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Unicode decoding error.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    def __str__(self) -> str:
        'Return str(self).'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    @property
    def encoding(self) -> typing.Any:
        'exception encoding'
        ...
    
    @property
    def end(self) -> typing.Any:
        'exception end'
        ...
    
    @property
    def object(self) -> typing.Any:
        'exception object'
        ...
    
    @property
    def reason(self) -> typing.Any:
        'exception reason'
        ...
    
    @property
    def start(self) -> typing.Any:
        'exception start'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class UnicodeEncodeError(UnicodeError):
    'Unicode encoding error.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Unicode encoding error.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    def __str__(self) -> str:
        'Return str(self).'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    @property
    def encoding(self) -> typing.Any:
        'exception encoding'
        ...
    
    @property
    def end(self) -> typing.Any:
        'exception end'
        ...
    
    @property
    def object(self) -> typing.Any:
        'exception object'
        ...
    
    @property
    def reason(self) -> typing.Any:
        'exception reason'
        ...
    
    @property
    def start(self) -> typing.Any:
        'exception start'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class UnicodeError(ValueError):
    'Unicode related error.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Unicode related error.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class UnicodeTranslateError(UnicodeError):
    'Unicode translation error.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Unicode translation error.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    def __str__(self) -> str:
        'Return str(self).'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    @property
    def encoding(self) -> typing.Any:
        'exception encoding'
        ...
    
    @property
    def end(self) -> typing.Any:
        'exception end'
        ...
    
    @property
    def object(self) -> typing.Any:
        'exception object'
        ...
    
    @property
    def reason(self) -> typing.Any:
        'exception reason'
        ...
    
    @property
    def start(self) -> typing.Any:
        'exception start'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class UnicodeWarning(Warning):
    'Base class for warnings about Unicode related problems, mostly\nrelated to conversion problems.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Base class for warnings about Unicode related problems, mostly\nrelated to conversion problems.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class UserWarning(Warning):
    'Base class for warnings generated by user code.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Base class for warnings generated by user code.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class ValueError(Exception):
    'Inappropriate argument value (of correct type).'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Inappropriate argument value (of correct type).'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class Warning(Exception):
    'Base class for warning categories.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Base class for warning categories.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class ZeroDivisionError(ArithmeticError):
    'Second argument to a division or modulo operation was zero.'
    __dict__: typing.Dict[str, typing.Any]
    def __init__(self, *args, **kwargs) -> None:
        'Second argument to a division or modulo operation was zero.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

def __build_class__(func, name, *bases, metaclass=..., **kwds) -> typing.Any:
    'Internal helper function used by the class statement.'
    ...

__debug__: bool
__doc__: str
def __import__(name, globals=..., locals=..., fromlist=..., level=...) -> typing.Any:
    "Import a module. Because this function is meant for use by the Python\ninterpreter and not for general use, it is better to use\nimportlib.import_module() to programmatically import a module.\n\nThe globals argument is only used to determine the context;\nthey are not modified.  The locals argument is unused.  The fromlist\nshould be a list of names to emulate ``from name import ...'', or an\nempty list to emulate ``import name''.\nWhen importing a module from a package, note that __import__('A.B', ...)\nreturns package A when fromlist is empty, but its submodule B when\nfromlist is not empty.  The level argument is used to determine whether to\nperform absolute or relative imports: 0 is absolute, while a positive number\nis the number of parent directories to search relative to the current module."
    ...

__name__: str
__package__: str
def abs(x) -> typing.Any:
    'Return the absolute value of the argument.'
    ...

def aiter(async_iterable) -> typing.Any:
    'Return an AsyncIterator for an AsyncIterable object.'
    ...

def all(iterable) -> typing.Any:
    'Return True if bool(x) is True for all values x in the iterable.\n\nIf the iterable is empty, return True.'
    ...

def anext() -> typing.Any:
    'Return the next item from the async iterator.'
    ...

def any(iterable) -> typing.Any:
    'Return True if bool(x) is True for any x in the iterable.\n\nIf the iterable is empty, return False.'
    ...

def ascii(obj) -> typing.Any:
    'Return an ASCII-only representation of an object.\n\nAs repr(), return a string containing a printable representation of an\nobject, but escape the non-ASCII characters in the string returned by\nrepr() using \\\\x, \\\\u or \\\\U escapes. This generates a string similar\nto that returned by repr() in Python 2.'
    ...

def bin(number) -> typing.Any:
    "Return the binary representation of an integer.\n\n   >>> bin(2796202)\n   '0b1010101010101010101010'"
    ...

class bool(int):
    'bool(x) -> bool\n\nReturns True when the argument x is true, False otherwise.\nThe builtins True and False are the only two instances of the class bool.\nThe class bool is a subclass of the class int, and cannot be subclassed.'
    def __and__(self, value) -> bool:
        'Return self&value.'
        ...
    
    def __init__(self, x) -> None:
        'bool(x) -> bool\n\nReturns True when the argument x is true, False otherwise.\nThe builtins True and False are the only two instances of the class bool.\nThe class bool is a subclass of the class int, and cannot be subclassed.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    def __or__(self, value) -> bool:
        'Return self|value.'
        ...
    
    def __rand__(self, value) -> bool:
        'Return value&self.'
        ...
    
    def __repr__(self) -> str:
        'Return repr(self).'
        ...
    
    def __ror__(self, value) -> bool:
        'Return value|self.'
        ...
    
    def __rxor__(self, value) -> bool:
        'Return value^self.'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __xor__(self, value) -> bool:
        'Return self^value.'
        ...
    
    @classmethod
    def from_bytes(cls, type, bytes, byteorder) -> typing.Any:
        "Return the integer represented by the given array of bytes.\n\n  bytes\n    Holds the array of bytes to convert.  The argument must either\n    support the buffer protocol or be an iterable object producing bytes.\n    Bytes and bytearray are examples of built-in objects that support the\n    buffer protocol.\n  byteorder\n    The byte order used to represent the integer.  If byteorder is 'big',\n    the most significant byte is at the beginning of the byte array.  If\n    byteorder is 'little', the most significant byte is at the end of the\n    byte array.  To request the native byte order of the host system, use\n    `sys.byteorder' as the byte order value.\n  signed\n    Indicates whether two's complement is used to represent the integer."
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

def breakpoint(*args, **kws) -> typing.Any:
    'Call sys.breakpointhook(*args, **kws).  sys.breakpointhook() must accept\nwhatever arguments are passed.\n\nBy default, this drops you into the pdb debugger.'
    ...

class bytearray(object):
    'bytearray(iterable_of_ints) -> bytearray\nbytearray(string, encoding[, errors]) -> bytearray\nbytearray(bytes_or_buffer) -> mutable copy of bytes_or_buffer\nbytearray(int) -> bytes array of size given by the parameter initialized with null bytes\nbytearray() -> empty bytes array\n\nConstruct a mutable bytearray object from:\n  - an iterable yielding integers in range(256)\n  - a text string encoded using the specified encoding\n  - a bytes or a buffer object\n  - any object implementing the buffer API.\n  - an integer'
    def __add__(self, value) -> bytearray:
        'Return self+value.'
        ...
    
    def __alloc__(self) -> int:
        'B.__alloc__() -> int\n\nReturn the number of bytes actually allocated.'
        ...
    
    def __contains__(self, key) -> bool:
        'Return key in self.'
        ...
    
    def __delitem__(self, key) -> None:
        'Delete self[key].'
        ...
    
    def __eq__(self, value) -> bool:
        'Return self==value.'
        ...
    
    def __ge__(self, value) -> bool:
        'Return self>=value.'
        ...
    
    def __getattribute__(self, name) -> typing.Any:
        'Return getattr(self, name).'
        ...
    
    def __getitem__(self, key) -> typing.Any:
        'Return self[key].'
        ...
    
    def __gt__(self, value) -> bool:
        'Return self>value.'
        ...
    
    __hash__: typing.Any
    def __iadd__(self, value) -> None:
        'Implement self+=value.'
        ...
    
    def __imul__(self, value) -> None:
        'Implement self*=value.'
        ...
    
    def __init__(self, iterable_of_ints) -> None:
        'bytearray(iterable_of_ints) -> bytearray\nbytearray(string, encoding[, errors]) -> bytearray\nbytearray(bytes_or_buffer) -> mutable copy of bytes_or_buffer\nbytearray(int) -> bytes array of size given by the parameter initialized with null bytes\nbytearray() -> empty bytes array\n\nConstruct a mutable bytearray object from:\n  - an iterable yielding integers in range(256)\n  - a text string encoded using the specified encoding\n  - a bytes or a buffer object\n  - any object implementing the buffer API.\n  - an integer'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    def __iter__(self) -> bytearray:
        'Implement iter(self).'
        ...
    
    def __le__(self, value) -> bool:
        'Return self<=value.'
        ...
    
    def __len__(self) -> int:
        'Return len(self).'
        ...
    
    def __lt__(self, value) -> bool:
        'Return self<value.'
        ...
    
    def __mod__(self, value) -> bytearray:
        'Return self%value.'
        ...
    
    def __mul__(self, value) -> bytearray:
        'Return self*value.'
        ...
    
    def __ne__(self, value) -> bool:
        'Return self!=value.'
        ...
    
    def __reduce__(self) -> typing.Union[str, typing.Tuple[typing.Any, ...]]:
        'Return state information for pickling.'
        ...
    
    def __reduce_ex__(self, proto) -> typing.Union[str, typing.Tuple[typing.Any, ...]]:
        'Return state information for pickling.'
        ...
    
    def __repr__(self) -> str:
        'Return repr(self).'
        ...
    
    def __rmod__(self, value) -> bytearray:
        'Return value%self.'
        ...
    
    def __rmul__(self, value) -> bytearray:
        'Return value*self.'
        ...
    
    def __setitem__(self, key, value) -> None:
        'Set self[key] to value.'
        ...
    
    def __sizeof__(self) -> int:
        'Returns the size of the bytearray object in memory, in bytes.'
        ...
    
    def __str__(self) -> str:
        'Return str(self).'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def append(self, item) -> typing.Any:
        'Append a single item to the end of the bytearray.\n\n  item\n    The item to be appended.'
        ...
    
    def capitalize(self) -> typing.Any:
        'B.capitalize() -> copy of B\n\nReturn a copy of B with only its first character capitalized (ASCII)\nand the rest lower-cased.'
        ...
    
    def center(self, width, fillchar) -> typing.Any:
        'Return a centered string of length width.\n\nPadding is done using the specified fill character.'
        ...
    
    def clear(self) -> typing.Any:
        'Remove all items from the bytearray.'
        ...
    
    def copy(self) -> typing.Any:
        'Return a copy of B.'
        ...
    
    def count(self, sub, start=..., end=...) -> int:
        'B.count(sub[, start[, end]]) -> int\n\nReturn the number of non-overlapping occurrences of subsection sub in\nbytes B[start:end].  Optional arguments start and end are interpreted\nas in slice notation.'
        ...
    
    def decode(self, encoding, errors) -> typing.Any:
        "Decode the bytearray using the codec registered for encoding.\n\n  encoding\n    The encoding with which to decode the bytearray.\n  errors\n    The error handling scheme to use for the handling of decoding errors.\n    The default is 'strict' meaning that decoding errors raise a\n    UnicodeDecodeError. Other possible values are 'ignore' and 'replace'\n    as well as any other name registered with codecs.register_error that\n    can handle UnicodeDecodeErrors."
        ...
    
    def endswith(self, suffix, start=..., end=...) -> bool:
        'B.endswith(suffix[, start[, end]]) -> bool\n\nReturn True if B ends with the specified suffix, False otherwise.\nWith optional start, test B beginning at that position.\nWith optional end, stop comparing B at that position.\nsuffix can also be a tuple of bytes to try.'
        ...
    
    def expandtabs(self, tabsize) -> typing.Any:
        'Return a copy where all tab characters are expanded using spaces.\n\nIf tabsize is not given, a tab size of 8 characters is assumed.'
        ...
    
    def extend(self, iterable_of_ints) -> typing.Any:
        'Append all the items from the iterator or sequence to the end of the bytearray.\n\n  iterable_of_ints\n    The iterable of items to append.'
        ...
    
    def find(self, sub, start=..., end=...) -> int:
        'B.find(sub[, start[, end]]) -> int\n\nReturn the lowest index in B where subsection sub is found,\nsuch that sub is contained within B[start,end].  Optional\narguments start and end are interpreted as in slice notation.\n\nReturn -1 on failure.'
        ...
    
    @classmethod
    def fromhex(cls, type, string) -> typing.Any:
        "Create a bytearray object from a string of hexadecimal numbers.\n\nSpaces between two numbers are accepted.\nExample: bytearray.fromhex('B9 01EF') -> bytearray(b'\\\\xb9\\\\x01\\\\xef')"
        ...
    
    def hex(self) -> typing.Any:
        "Create a string of hexadecimal numbers from a bytearray object.\n\n  sep\n    An optional single character or byte to separate hex bytes.\n  bytes_per_sep\n    How many bytes between separators.  Positive values count from the\n    right, negative values count from the left.\n\nExample:\n>>> value = bytearray([0xb9, 0x01, 0xef])\n>>> value.hex()\n'b901ef'\n>>> value.hex(':')\n'b9:01:ef'\n>>> value.hex(':', 2)\n'b9:01ef'\n>>> value.hex(':', -2)\n'b901:ef'"
        ...
    
    def index(self, sub, start=..., end=...) -> int:
        'B.index(sub[, start[, end]]) -> int\n\nReturn the lowest index in B where subsection sub is found,\nsuch that sub is contained within B[start,end].  Optional\narguments start and end are interpreted as in slice notation.\n\nRaises ValueError when the subsection is not found.'
        ...
    
    def insert(self, index, item) -> typing.Any:
        'Insert a single item into the bytearray before the given index.\n\n  index\n    The index where the value is to be inserted.\n  item\n    The item to be inserted.'
        ...
    
    def isalnum(self) -> bool:
        'B.isalnum() -> bool\n\nReturn True if all characters in B are alphanumeric\nand there is at least one character in B, False otherwise.'
        ...
    
    def isalpha(self) -> bool:
        'B.isalpha() -> bool\n\nReturn True if all characters in B are alphabetic\nand there is at least one character in B, False otherwise.'
        ...
    
    def isascii(self) -> bool:
        'B.isascii() -> bool\n\nReturn True if B is empty or all characters in B are ASCII,\nFalse otherwise.'
        ...
    
    def isdigit(self) -> bool:
        'B.isdigit() -> bool\n\nReturn True if all characters in B are digits\nand there is at least one character in B, False otherwise.'
        ...
    
    def islower(self) -> bool:
        'B.islower() -> bool\n\nReturn True if all cased characters in B are lowercase and there is\nat least one cased character in B, False otherwise.'
        ...
    
    def isspace(self) -> bool:
        'B.isspace() -> bool\n\nReturn True if all characters in B are whitespace\nand there is at least one character in B, False otherwise.'
        ...
    
    def istitle(self) -> bool:
        'B.istitle() -> bool\n\nReturn True if B is a titlecased string and there is at least one\ncharacter in B, i.e. uppercase characters may only follow uncased\ncharacters and lowercase characters only cased ones. Return False\notherwise.'
        ...
    
    def isupper(self) -> bool:
        'B.isupper() -> bool\n\nReturn True if all cased characters in B are uppercase and there is\nat least one cased character in B, False otherwise.'
        ...
    
    def join(self, iterable_of_bytes) -> typing.Any:
        'Concatenate any number of bytes/bytearray objects.\n\nThe bytearray whose method is called is inserted in between each pair.\n\nThe result is returned as a new bytearray object.'
        ...
    
    def ljust(self, width, fillchar) -> typing.Any:
        'Return a left-justified string of length width.\n\nPadding is done using the specified fill character.'
        ...
    
    def lower(self) -> typing.Any:
        'B.lower() -> copy of B\n\nReturn a copy of B with all ASCII characters converted to lowercase.'
        ...
    
    def lstrip(self, bytes) -> typing.Any:
        'Strip leading bytes contained in the argument.\n\nIf the argument is omitted or None, strip leading ASCII whitespace.'
        ...
    
    @classmethod
    def maketrans(cls, frm, to) -> typing.Any:
        'Return a translation table useable for the bytes or bytearray translate method.\n\nThe returned table will be one where each byte in frm is mapped to the byte at\nthe same position in to.\n\nThe bytes objects frm and to must be of the same length.'
        ...
    
    def partition(self, sep) -> typing.Any:
        'Partition the bytearray into three parts using the given separator.\n\nThis will search for the separator sep in the bytearray. If the separator is\nfound, returns a 3-tuple containing the part before the separator, the\nseparator itself, and the part after it as new bytearray objects.\n\nIf the separator is not found, returns a 3-tuple containing the copy of the\noriginal bytearray object and two empty bytearray objects.'
        ...
    
    def pop(self, index) -> typing.Any:
        'Remove and return a single item from B.\n\n  index\n    The index from where to remove the item.\n    -1 (the default value) means remove the last item.\n\nIf no index argument is given, will pop the last item.'
        ...
    
    def remove(self, value) -> typing.Any:
        'Remove the first occurrence of a value in the bytearray.\n\n  value\n    The value to remove.'
        ...
    
    def removeprefix(self, prefix) -> typing.Any:
        'Return a bytearray with the given prefix string removed if present.\n\nIf the bytearray starts with the prefix string, return\nbytearray[len(prefix):].  Otherwise, return a copy of the original\nbytearray.'
        ...
    
    def removesuffix(self, suffix) -> typing.Any:
        'Return a bytearray with the given suffix string removed if present.\n\nIf the bytearray ends with the suffix string and that suffix is not\nempty, return bytearray[:-len(suffix)].  Otherwise, return a copy of\nthe original bytearray.'
        ...
    
    def replace(self, old, new, count) -> typing.Any:
        'Return a copy with all occurrences of substring old replaced by new.\n\n  count\n    Maximum number of occurrences to replace.\n    -1 (the default value) means replace all occurrences.\n\nIf the optional argument count is given, only the first count occurrences are\nreplaced.'
        ...
    
    def reverse(self) -> typing.Any:
        'Reverse the order of the values in B in place.'
        ...
    
    def rfind(self, sub, start=..., end=...) -> int:
        'B.rfind(sub[, start[, end]]) -> int\n\nReturn the highest index in B where subsection sub is found,\nsuch that sub is contained within B[start,end].  Optional\narguments start and end are interpreted as in slice notation.\n\nReturn -1 on failure.'
        ...
    
    def rindex(self, sub, start=..., end=...) -> int:
        'B.rindex(sub[, start[, end]]) -> int\n\nReturn the highest index in B where subsection sub is found,\nsuch that sub is contained within B[start,end].  Optional\narguments start and end are interpreted as in slice notation.\n\nRaise ValueError when the subsection is not found.'
        ...
    
    def rjust(self, width, fillchar) -> typing.Any:
        'Return a right-justified string of length width.\n\nPadding is done using the specified fill character.'
        ...
    
    def rpartition(self, sep) -> typing.Any:
        'Partition the bytearray into three parts using the given separator.\n\nThis will search for the separator sep in the bytearray, starting at the end.\nIf the separator is found, returns a 3-tuple containing the part before the\nseparator, the separator itself, and the part after it as new bytearray\nobjects.\n\nIf the separator is not found, returns a 3-tuple containing two empty bytearray\nobjects and the copy of the original bytearray object.'
        ...
    
    def rsplit(self, sep, maxsplit) -> typing.Any:
        'Return a list of the sections in the bytearray, using sep as the delimiter.\n\n  sep\n    The delimiter according which to split the bytearray.\n    None (the default value) means split on ASCII whitespace characters\n    (space, tab, return, newline, formfeed, vertical tab).\n  maxsplit\n    Maximum number of splits to do.\n    -1 (the default value) means no limit.\n\nSplitting is done starting at the end of the bytearray and working to the front.'
        ...
    
    def rstrip(self, bytes) -> typing.Any:
        'Strip trailing bytes contained in the argument.\n\nIf the argument is omitted or None, strip trailing ASCII whitespace.'
        ...
    
    def split(self, sep, maxsplit) -> typing.Any:
        'Return a list of the sections in the bytearray, using sep as the delimiter.\n\n  sep\n    The delimiter according which to split the bytearray.\n    None (the default value) means split on ASCII whitespace characters\n    (space, tab, return, newline, formfeed, vertical tab).\n  maxsplit\n    Maximum number of splits to do.\n    -1 (the default value) means no limit.'
        ...
    
    def splitlines(self, keepends) -> typing.Any:
        'Return a list of the lines in the bytearray, breaking at line boundaries.\n\nLine breaks are not included in the resulting list unless keepends is given and\ntrue.'
        ...
    
    def startswith(self, prefix, start=..., end=...) -> bool:
        'B.startswith(prefix[, start[, end]]) -> bool\n\nReturn True if B starts with the specified prefix, False otherwise.\nWith optional start, test B beginning at that position.\nWith optional end, stop comparing B at that position.\nprefix can also be a tuple of bytes to try.'
        ...
    
    def strip(self, bytes) -> typing.Any:
        'Strip leading and trailing bytes contained in the argument.\n\nIf the argument is omitted or None, strip leading and trailing ASCII whitespace.'
        ...
    
    def swapcase(self) -> typing.Any:
        'B.swapcase() -> copy of B\n\nReturn a copy of B with uppercase ASCII characters converted\nto lowercase ASCII and vice versa.'
        ...
    
    def title(self) -> typing.Any:
        'B.title() -> copy of B\n\nReturn a titlecased version of B, i.e. ASCII words start with uppercase\ncharacters, all remaining cased characters have lowercase.'
        ...
    
    def translate(self, table, delete) -> typing.Any:
        'Return a copy with each character mapped by the given translation table.\n\n  table\n    Translation table, which must be a bytes object of length 256.\n\nAll characters occurring in the optional argument delete are removed.\nThe remaining characters are mapped through the given translation table.'
        ...
    
    def upper(self) -> typing.Any:
        'B.upper() -> copy of B\n\nReturn a copy of B with all ASCII characters converted to uppercase.'
        ...
    
    def zfill(self, width) -> typing.Any:
        'Pad a numeric string with zeros on the left, to fill a field of the given width.\n\nThe original string is never truncated.'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class bytes(object):
    'bytes(iterable_of_ints) -> bytes\nbytes(string, encoding[, errors]) -> bytes\nbytes(bytes_or_buffer) -> immutable copy of bytes_or_buffer\nbytes(int) -> bytes object of size given by the parameter initialized with null bytes\nbytes() -> empty bytes object\n\nConstruct an immutable array of bytes from:\n  - an iterable yielding integers in range(256)\n  - a text string encoded using the specified encoding\n  - any object implementing the buffer API.\n  - an integer'
    def __add__(self, value) -> bytes:
        'Return self+value.'
        ...
    
    def __contains__(self, key) -> bool:
        'Return key in self.'
        ...
    
    def __eq__(self, value) -> bool:
        'Return self==value.'
        ...
    
    def __ge__(self, value) -> bool:
        'Return self>=value.'
        ...
    
    def __getattribute__(self, name) -> typing.Any:
        'Return getattr(self, name).'
        ...
    
    def __getitem__(self, key) -> typing.Any:
        'Return self[key].'
        ...
    
    def __getnewargs__(self) -> typing.Tuple[bytes]:
        ...
    
    def __gt__(self, value) -> bool:
        'Return self>value.'
        ...
    
    def __hash__(self) -> int:
        'Return hash(self).'
        ...
    
    def __init__(self, iterable_of_ints) -> None:
        'bytes(iterable_of_ints) -> bytes\nbytes(string, encoding[, errors]) -> bytes\nbytes(bytes_or_buffer) -> immutable copy of bytes_or_buffer\nbytes(int) -> bytes object of size given by the parameter initialized with null bytes\nbytes() -> empty bytes object\n\nConstruct an immutable array of bytes from:\n  - an iterable yielding integers in range(256)\n  - a text string encoded using the specified encoding\n  - any object implementing the buffer API.\n  - an integer'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    def __iter__(self) -> bytes:
        'Implement iter(self).'
        ...
    
    def __le__(self, value) -> bool:
        'Return self<=value.'
        ...
    
    def __len__(self) -> int:
        'Return len(self).'
        ...
    
    def __lt__(self, value) -> bool:
        'Return self<value.'
        ...
    
    def __mod__(self, value) -> bytes:
        'Return self%value.'
        ...
    
    def __mul__(self, value) -> bytes:
        'Return self*value.'
        ...
    
    def __ne__(self, value) -> bool:
        'Return self!=value.'
        ...
    
    def __repr__(self) -> str:
        'Return repr(self).'
        ...
    
    def __rmod__(self, value) -> bytes:
        'Return value%self.'
        ...
    
    def __rmul__(self, value) -> bytes:
        'Return value*self.'
        ...
    
    def __str__(self) -> str:
        'Return str(self).'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def capitalize(self) -> typing.Any:
        'B.capitalize() -> copy of B\n\nReturn a copy of B with only its first character capitalized (ASCII)\nand the rest lower-cased.'
        ...
    
    def center(self, width, fillchar) -> typing.Any:
        'Return a centered string of length width.\n\nPadding is done using the specified fill character.'
        ...
    
    def count(self, sub, start=..., end=...) -> int:
        'B.count(sub[, start[, end]]) -> int\n\nReturn the number of non-overlapping occurrences of subsection sub in\nbytes B[start:end].  Optional arguments start and end are interpreted\nas in slice notation.'
        ...
    
    def decode(self, encoding, errors) -> typing.Any:
        "Decode the bytes using the codec registered for encoding.\n\n  encoding\n    The encoding with which to decode the bytes.\n  errors\n    The error handling scheme to use for the handling of decoding errors.\n    The default is 'strict' meaning that decoding errors raise a\n    UnicodeDecodeError. Other possible values are 'ignore' and 'replace'\n    as well as any other name registered with codecs.register_error that\n    can handle UnicodeDecodeErrors."
        ...
    
    def endswith(self, suffix, start=..., end=...) -> bool:
        'B.endswith(suffix[, start[, end]]) -> bool\n\nReturn True if B ends with the specified suffix, False otherwise.\nWith optional start, test B beginning at that position.\nWith optional end, stop comparing B at that position.\nsuffix can also be a tuple of bytes to try.'
        ...
    
    def expandtabs(self, tabsize) -> typing.Any:
        'Return a copy where all tab characters are expanded using spaces.\n\nIf tabsize is not given, a tab size of 8 characters is assumed.'
        ...
    
    def find(self, sub, start=..., end=...) -> int:
        'B.find(sub[, start[, end]]) -> int\n\nReturn the lowest index in B where subsection sub is found,\nsuch that sub is contained within B[start,end].  Optional\narguments start and end are interpreted as in slice notation.\n\nReturn -1 on failure.'
        ...
    
    @classmethod
    def fromhex(cls, type, string) -> typing.Any:
        "Create a bytes object from a string of hexadecimal numbers.\n\nSpaces between two numbers are accepted.\nExample: bytes.fromhex('B9 01EF') -> b'\\\\xb9\\\\x01\\\\xef'."
        ...
    
    def hex(self) -> typing.Any:
        "Create a string of hexadecimal numbers from a bytes object.\n\n  sep\n    An optional single character or byte to separate hex bytes.\n  bytes_per_sep\n    How many bytes between separators.  Positive values count from the\n    right, negative values count from the left.\n\nExample:\n>>> value = b'\\xb9\\x01\\xef'\n>>> value.hex()\n'b901ef'\n>>> value.hex(':')\n'b9:01:ef'\n>>> value.hex(':', 2)\n'b9:01ef'\n>>> value.hex(':', -2)\n'b901:ef'"
        ...
    
    def index(self, sub, start=..., end=...) -> int:
        'B.index(sub[, start[, end]]) -> int\n\nReturn the lowest index in B where subsection sub is found,\nsuch that sub is contained within B[start,end].  Optional\narguments start and end are interpreted as in slice notation.\n\nRaises ValueError when the subsection is not found.'
        ...
    
    def isalnum(self) -> bool:
        'B.isalnum() -> bool\n\nReturn True if all characters in B are alphanumeric\nand there is at least one character in B, False otherwise.'
        ...
    
    def isalpha(self) -> bool:
        'B.isalpha() -> bool\n\nReturn True if all characters in B are alphabetic\nand there is at least one character in B, False otherwise.'
        ...
    
    def isascii(self) -> bool:
        'B.isascii() -> bool\n\nReturn True if B is empty or all characters in B are ASCII,\nFalse otherwise.'
        ...
    
    def isdigit(self) -> bool:
        'B.isdigit() -> bool\n\nReturn True if all characters in B are digits\nand there is at least one character in B, False otherwise.'
        ...
    
    def islower(self) -> bool:
        'B.islower() -> bool\n\nReturn True if all cased characters in B are lowercase and there is\nat least one cased character in B, False otherwise.'
        ...
    
    def isspace(self) -> bool:
        'B.isspace() -> bool\n\nReturn True if all characters in B are whitespace\nand there is at least one character in B, False otherwise.'
        ...
    
    def istitle(self) -> bool:
        'B.istitle() -> bool\n\nReturn True if B is a titlecased string and there is at least one\ncharacter in B, i.e. uppercase characters may only follow uncased\ncharacters and lowercase characters only cased ones. Return False\notherwise.'
        ...
    
    def isupper(self) -> bool:
        'B.isupper() -> bool\n\nReturn True if all cased characters in B are uppercase and there is\nat least one cased character in B, False otherwise.'
        ...
    
    def join(self, iterable_of_bytes) -> typing.Any:
        "Concatenate any number of bytes objects.\n\nThe bytes whose method is called is inserted in between each pair.\n\nThe result is returned as a new bytes object.\n\nExample: b'.'.join([b'ab', b'pq', b'rs']) -> b'ab.pq.rs'."
        ...
    
    def ljust(self, width, fillchar) -> typing.Any:
        'Return a left-justified string of length width.\n\nPadding is done using the specified fill character.'
        ...
    
    def lower(self) -> typing.Any:
        'B.lower() -> copy of B\n\nReturn a copy of B with all ASCII characters converted to lowercase.'
        ...
    
    def lstrip(self, bytes) -> typing.Any:
        'Strip leading bytes contained in the argument.\n\nIf the argument is omitted or None, strip leading  ASCII whitespace.'
        ...
    
    @classmethod
    def maketrans(cls, frm, to) -> typing.Any:
        'Return a translation table useable for the bytes or bytearray translate method.\n\nThe returned table will be one where each byte in frm is mapped to the byte at\nthe same position in to.\n\nThe bytes objects frm and to must be of the same length.'
        ...
    
    def partition(self, sep) -> typing.Any:
        'Partition the bytes into three parts using the given separator.\n\nThis will search for the separator sep in the bytes. If the separator is found,\nreturns a 3-tuple containing the part before the separator, the separator\nitself, and the part after it.\n\nIf the separator is not found, returns a 3-tuple containing the original bytes\nobject and two empty bytes objects.'
        ...
    
    def removeprefix(self, prefix) -> typing.Any:
        'Return a bytes object with the given prefix string removed if present.\n\nIf the bytes starts with the prefix string, return bytes[len(prefix):].\nOtherwise, return a copy of the original bytes.'
        ...
    
    def removesuffix(self, suffix) -> typing.Any:
        'Return a bytes object with the given suffix string removed if present.\n\nIf the bytes ends with the suffix string and that suffix is not empty,\nreturn bytes[:-len(prefix)].  Otherwise, return a copy of the original\nbytes.'
        ...
    
    def replace(self, old, new, count) -> typing.Any:
        'Return a copy with all occurrences of substring old replaced by new.\n\n  count\n    Maximum number of occurrences to replace.\n    -1 (the default value) means replace all occurrences.\n\nIf the optional argument count is given, only the first count occurrences are\nreplaced.'
        ...
    
    def rfind(self, sub, start=..., end=...) -> int:
        'B.rfind(sub[, start[, end]]) -> int\n\nReturn the highest index in B where subsection sub is found,\nsuch that sub is contained within B[start,end].  Optional\narguments start and end are interpreted as in slice notation.\n\nReturn -1 on failure.'
        ...
    
    def rindex(self, sub, start=..., end=...) -> int:
        'B.rindex(sub[, start[, end]]) -> int\n\nReturn the highest index in B where subsection sub is found,\nsuch that sub is contained within B[start,end].  Optional\narguments start and end are interpreted as in slice notation.\n\nRaise ValueError when the subsection is not found.'
        ...
    
    def rjust(self, width, fillchar) -> typing.Any:
        'Return a right-justified string of length width.\n\nPadding is done using the specified fill character.'
        ...
    
    def rpartition(self, sep) -> typing.Any:
        'Partition the bytes into three parts using the given separator.\n\nThis will search for the separator sep in the bytes, starting at the end. If\nthe separator is found, returns a 3-tuple containing the part before the\nseparator, the separator itself, and the part after it.\n\nIf the separator is not found, returns a 3-tuple containing two empty bytes\nobjects and the original bytes object.'
        ...
    
    def rsplit(self, sep, maxsplit) -> typing.Any:
        'Return a list of the sections in the bytes, using sep as the delimiter.\n\n  sep\n    The delimiter according which to split the bytes.\n    None (the default value) means split on ASCII whitespace characters\n    (space, tab, return, newline, formfeed, vertical tab).\n  maxsplit\n    Maximum number of splits to do.\n    -1 (the default value) means no limit.\n\nSplitting is done starting at the end of the bytes and working to the front.'
        ...
    
    def rstrip(self, bytes) -> typing.Any:
        'Strip trailing bytes contained in the argument.\n\nIf the argument is omitted or None, strip trailing ASCII whitespace.'
        ...
    
    def split(self, sep, maxsplit) -> typing.Any:
        'Return a list of the sections in the bytes, using sep as the delimiter.\n\n  sep\n    The delimiter according which to split the bytes.\n    None (the default value) means split on ASCII whitespace characters\n    (space, tab, return, newline, formfeed, vertical tab).\n  maxsplit\n    Maximum number of splits to do.\n    -1 (the default value) means no limit.'
        ...
    
    def splitlines(self, keepends) -> typing.Any:
        'Return a list of the lines in the bytes, breaking at line boundaries.\n\nLine breaks are not included in the resulting list unless keepends is given and\ntrue.'
        ...
    
    def startswith(self, prefix, start=..., end=...) -> bool:
        'B.startswith(prefix[, start[, end]]) -> bool\n\nReturn True if B starts with the specified prefix, False otherwise.\nWith optional start, test B beginning at that position.\nWith optional end, stop comparing B at that position.\nprefix can also be a tuple of bytes to try.'
        ...
    
    def strip(self, bytes) -> typing.Any:
        'Strip leading and trailing bytes contained in the argument.\n\nIf the argument is omitted or None, strip leading and trailing ASCII whitespace.'
        ...
    
    def swapcase(self) -> typing.Any:
        'B.swapcase() -> copy of B\n\nReturn a copy of B with uppercase ASCII characters converted\nto lowercase ASCII and vice versa.'
        ...
    
    def title(self) -> typing.Any:
        'B.title() -> copy of B\n\nReturn a titlecased version of B, i.e. ASCII words start with uppercase\ncharacters, all remaining cased characters have lowercase.'
        ...
    
    def translate(self, table, delete) -> typing.Any:
        'Return a copy with each character mapped by the given translation table.\n\n  table\n    Translation table, which must be a bytes object of length 256.\n\nAll characters occurring in the optional argument delete are removed.\nThe remaining characters are mapped through the given translation table.'
        ...
    
    def upper(self) -> typing.Any:
        'B.upper() -> copy of B\n\nReturn a copy of B with all ASCII characters converted to uppercase.'
        ...
    
    def zfill(self, width) -> typing.Any:
        'Pad a numeric string with zeros on the left, to fill a field of the given width.\n\nThe original string is never truncated.'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

def callable(obj) -> typing.Any:
    'Return whether the object is callable (i.e., some kind of function).\n\nNote that classes are callable, as are instances of classes with a\n__call__() method.'
    ...

def chr(i) -> typing.Any:
    'Return a Unicode string of one character with ordinal i; 0 <= i <= 0x10ffff.'
    ...

class classmethod(object):
    'classmethod(function) -> method\n\nConvert a function to be a class method.\n\nA class method receives the class as implicit first argument,\njust like an instance method receives the instance.\nTo declare a class method, use this idiom:\n\n  class C:\n      @classmethod\n      def f(cls, arg1, arg2, ...):\n          ...\n\nIt can be called either on the class (e.g. C.f()) or on an instance\n(e.g. C().f()).  The instance is ignored except for its class.\nIf a class method is called for a derived class, the derived class\nobject is passed as the implied first argument.\n\nClass methods are different than C++ or Java static methods.\nIf you want those, see the staticmethod builtin.'
    __dict__: typing.Dict[str, typing.Any]
    @property
    def __func__(self) -> typing.Any:
        ...
    
    def __get__(self, instance, owner) -> classmethod:
        'Return an attribute of instance, which is of type owner.'
        ...
    
    def __init__(self, function) -> None:
        'classmethod(function) -> method\n\nConvert a function to be a class method.\n\nA class method receives the class as implicit first argument,\njust like an instance method receives the instance.\nTo declare a class method, use this idiom:\n\n  class C:\n      @classmethod\n      def f(cls, arg1, arg2, ...):\n          ...\n\nIt can be called either on the class (e.g. C.f()) or on an instance\n(e.g. C().f()).  The instance is ignored except for its class.\nIf a class method is called for a derived class, the derived class\nobject is passed as the implied first argument.\n\nClass methods are different than C++ or Java static methods.\nIf you want those, see the staticmethod builtin.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @property
    def __isabstractmethod__(self) -> typing.Any:
        ...
    
    def __repr__(self) -> str:
        'Return repr(self).'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    @property
    def __wrapped__(self) -> typing.Any:
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

def compile(source, filename, mode, flags, dont_inherit, optimize) -> typing.Any:
    "Compile source into a code object that can be executed by exec() or eval().\n\nThe source code may represent a Python module, statement or expression.\nThe filename will be used for run-time error messages.\nThe mode must be 'exec' to compile a module, 'single' to compile a\nsingle (interactive) statement, or 'eval' to compile an expression.\nThe flags argument, if present, controls which future statements influence\nthe compilation of the code.\nThe dont_inherit argument, if true, stops the compilation inheriting\nthe effects of any future statements in effect in the code calling\ncompile; if absent or false these statements do influence the compilation,\nin addition to any features explicitly specified."
    ...

class complex(object):
    'Create a complex number from a real part and an optional imaginary part.\n\nThis is equivalent to (real + imag*1j) where imag defaults to 0.'
    def __abs__(self) -> complex:
        'abs(self)'
        ...
    
    def __add__(self, value) -> complex:
        'Return self+value.'
        ...
    
    def __bool__(self) -> bool:
        'True if self else False'
        ...
    
    def __eq__(self, value) -> bool:
        'Return self==value.'
        ...
    
    def __format__(self, format_spec) -> str:
        'Convert to a string according to format_spec.'
        ...
    
    def __ge__(self, value) -> bool:
        'Return self>=value.'
        ...
    
    def __getattribute__(self, name) -> typing.Any:
        'Return getattr(self, name).'
        ...
    
    def __getnewargs__(self) -> typing.Tuple[complex]:
        ...
    
    def __gt__(self, value) -> bool:
        'Return self>value.'
        ...
    
    def __hash__(self) -> int:
        'Return hash(self).'
        ...
    
    def __init__(self, *args, **kwargs) -> None:
        'Create a complex number from a real part and an optional imaginary part.\n\nThis is equivalent to (real + imag*1j) where imag defaults to 0.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    def __le__(self, value) -> bool:
        'Return self<=value.'
        ...
    
    def __lt__(self, value) -> bool:
        'Return self<value.'
        ...
    
    def __mul__(self, value) -> complex:
        'Return self*value.'
        ...
    
    def __ne__(self, value) -> bool:
        'Return self!=value.'
        ...
    
    def __neg__(self) -> complex:
        '-self'
        ...
    
    def __pos__(self) -> complex:
        '+self'
        ...
    
    def __pow__(self, value, mod) -> complex:
        'Return pow(self, value, mod).'
        ...
    
    def __radd__(self, value) -> complex:
        'Return value+self.'
        ...
    
    def __repr__(self) -> str:
        'Return repr(self).'
        ...
    
    def __rmul__(self, value) -> complex:
        'Return value*self.'
        ...
    
    def __rpow__(self, value, mod) -> complex:
        'Return pow(value, self, mod).'
        ...
    
    def __rsub__(self, value) -> complex:
        'Return value-self.'
        ...
    
    def __rtruediv__(self, value) -> complex:
        'Return value/self.'
        ...
    
    def __sub__(self, value) -> complex:
        'Return self-value.'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __truediv__(self, value) -> float:
        'Return self/value.'
        ...
    
    def conjugate(self) -> typing.Any:
        'Return the complex conjugate of its argument. (3-4j).conjugate() == 3+4j.'
        ...
    
    @property
    def imag(self) -> typing.Any:
        'the imaginary part of a complex number'
        ...
    
    @property
    def real(self) -> typing.Any:
        'the real part of a complex number'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

def delattr(obj, name) -> typing.Any:
    "Deletes the named attribute from the given object.\n\ndelattr(x, 'y') is equivalent to ``del x.y''"
    ...

class dict(object):
    "dict() -> new empty dictionary\ndict(mapping) -> new dictionary initialized from a mapping object's\n    (key, value) pairs\ndict(iterable) -> new dictionary initialized as if via:\n    d = {}\n    for k, v in iterable:\n        d[k] = v\ndict(**kwargs) -> new dictionary initialized with the name=value pairs\n    in the keyword argument list.  For example:  dict(one=1, two=2)"
    @classmethod
    def __class_getitem__(cls) -> typing.Any:
        'See PEP 585'
        ...
    
    def __contains__(self, key) -> bool:
        'True if the dictionary has the specified key, else False.'
        ...
    
    def __delitem__(self, key) -> None:
        'Delete self[key].'
        ...
    
    def __eq__(self, value) -> bool:
        'Return self==value.'
        ...
    
    def __ge__(self, value) -> bool:
        'Return self>=value.'
        ...
    
    def __getattribute__(self, name) -> typing.Any:
        'Return getattr(self, name).'
        ...
    
    def __getitem__(self, index: int) -> typing.Any:
        'x.__getitem__(y) <==> x[y]'
        ...
    
    def __gt__(self, value) -> bool:
        'Return self>value.'
        ...
    
    __hash__: typing.Any
    def __init__(self, *args, **kwargs) -> None:
        "dict() -> new empty dictionary\ndict(mapping) -> new dictionary initialized from a mapping object's\n    (key, value) pairs\ndict(iterable) -> new dictionary initialized as if via:\n    d = {}\n    for k, v in iterable:\n        d[k] = v\ndict(**kwargs) -> new dictionary initialized with the name=value pairs\n    in the keyword argument list.  For example:  dict(one=1, two=2)"
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    def __ior__(self, value) -> None:
        'Return self|=value.'
        ...
    
    def __iter__(self) -> dict:
        'Implement iter(self).'
        ...
    
    def __le__(self, value) -> bool:
        'Return self<=value.'
        ...
    
    def __len__(self) -> int:
        'Return len(self).'
        ...
    
    def __lt__(self, value) -> bool:
        'Return self<value.'
        ...
    
    def __ne__(self, value) -> bool:
        'Return self!=value.'
        ...
    
    def __or__(self, value) -> dict:
        'Return self|value.'
        ...
    
    def __repr__(self) -> str:
        'Return repr(self).'
        ...
    
    def __reversed__(self) -> typing.Any:
        'Return a reverse iterator over the dict keys.'
        ...
    
    def __ror__(self, value) -> dict:
        'Return value|self.'
        ...
    
    def __setitem__(self, key, value) -> None:
        'Set self[key] to value.'
        ...
    
    def __sizeof__(self) -> int:
        'D.__sizeof__() -> size of D in memory, in bytes'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def clear(self) -> typing.Any:
        'D.clear() -> None.  Remove all items from D.'
        ...
    
    def copy(self) -> typing.Any:
        'D.copy() -> a shallow copy of D'
        ...
    
    @classmethod
    def fromkeys(cls, type, iterable, value) -> typing.Any:
        'Create a new dictionary with keys from iterable and values set to value.'
        ...
    
    def get(self, key, default) -> typing.Any:
        'Return the value for key if key is in the dictionary, else default.'
        ...
    
    def items(self) -> typing.Any:
        "D.items() -> a set-like object providing a view on D's items"
        ...
    
    def keys(self) -> typing.Any:
        "D.keys() -> a set-like object providing a view on D's keys"
        ...
    
    def pop(self, k, d=...) -> typing.Any:
        'D.pop(k[,d]) -> v, remove specified key and return the corresponding value.\n\nIf the key is not found, return the default if given; otherwise,\nraise a KeyError.'
        ...
    
    def popitem(self) -> typing.Any:
        'Remove and return a (key, value) pair as a 2-tuple.\n\nPairs are returned in LIFO (last-in, first-out) order.\nRaises KeyError if the dict is empty.'
        ...
    
    def setdefault(self, key, default) -> typing.Any:
        'Insert key with a value of default if key is not in the dictionary.\n\nReturn the value for key if key is in the dictionary, else default.'
        ...
    
    def update(self, E=..., **F) -> typing.Any:
        'D.update([E, ]**F) -> None.  Update D from dict/iterable E and F.\nIf E is present and has a .keys() method, then does:  for k in E: D[k] = E[k]\nIf E is present and lacks a .keys() method, then does:  for k, v in E: D[k] = v\nIn either case, this is followed by: for k in F:  D[k] = F[k]'
        ...
    
    def values(self) -> typing.Any:
        "D.values() -> an object providing a view on D's values"
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

def dir(object=...) -> typing.List[typing.Any]:
    "If called without an argument, return the names in the current scope.\nElse, return an alphabetized list of names comprising (some of) the attributes\nof the given object, and of attributes reachable from it.\nIf the object supplies a method named __dir__, it will be used; otherwise\nthe default dir() logic is used and returns:\n  for a module object: the module's attributes.\n  for a class object:  its attributes, and recursively the attributes\n    of its bases.\n  for any other object: its attributes, its class's attributes, and\n    recursively the attributes of its class's base classes."
    ...

def divmod(x, y) -> typing.Any:
    'Return the tuple (x//y, x%y).  Invariant: div*y + mod == x.'
    ...

class enumerate(object):
    'Return an enumerate object.\n\n  iterable\n    an object supporting iteration\n\nThe enumerate object yields pairs containing a count (from start, which\ndefaults to zero) and a value yielded by the iterable argument.\n\nenumerate is useful for obtaining an indexed list:\n    (0, seq[0]), (1, seq[1]), (2, seq[2]), ...'
    @classmethod
    def __class_getitem__(cls) -> typing.Any:
        'See PEP 585'
        ...
    
    def __getattribute__(self, name) -> typing.Any:
        'Return getattr(self, name).'
        ...
    
    def __init__(self, *args, **kwargs) -> None:
        'Return an enumerate object.\n\n  iterable\n    an object supporting iteration\n\nThe enumerate object yields pairs containing a count (from start, which\ndefaults to zero) and a value yielded by the iterable argument.\n\nenumerate is useful for obtaining an indexed list:\n    (0, seq[0]), (1, seq[1]), (2, seq[2]), ...'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    def __iter__(self) -> enumerate:
        'Implement iter(self).'
        ...
    
    def __next__(self) -> typing.Any:
        'Implement next(self).'
        ...
    
    def __reduce__(self) -> typing.Union[str, typing.Tuple[typing.Any, ...]]:
        'Return state information for pickling.'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

def eval(source, globals, locals) -> typing.Any:
    'Evaluate the given source in the context of globals and locals.\n\nThe source may be a string representing a Python expression\nor a code object as returned by compile().\nThe globals must be a dictionary and locals can be any mapping,\ndefaulting to the current globals and locals.\nIf only globals is given, locals defaults to it.'
    ...

def exec(source, globals, locals) -> typing.Any:
    'Execute the given source in the context of globals and locals.\n\nThe source may be a string representing one or more Python statements\nor a code object as returned by compile().\nThe globals must be a dictionary and locals can be any mapping,\ndefaulting to the current globals and locals.\nIf only globals is given, locals defaults to it.'
    ...

class filter(object):
    'filter(function or None, iterable) --> filter object\n\nReturn an iterator yielding those items of iterable for which function(item)\nis true. If function is None, return the items that are true.'
    def __getattribute__(self, name) -> typing.Any:
        'Return getattr(self, name).'
        ...
    
    def __init__(self, functionorNone, iterable) -> None:
        'filter(function or None, iterable) --> filter object\n\nReturn an iterator yielding those items of iterable for which function(item)\nis true. If function is None, return the items that are true.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    def __iter__(self) -> filter:
        'Implement iter(self).'
        ...
    
    def __next__(self) -> typing.Any:
        'Implement next(self).'
        ...
    
    def __reduce__(self) -> typing.Union[str, typing.Tuple[typing.Any, ...]]:
        'Return state information for pickling.'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class float(object):
    'Convert a string or number to a floating point number, if possible.'
    def __abs__(self) -> float:
        'abs(self)'
        ...
    
    def __add__(self, value) -> float:
        'Return self+value.'
        ...
    
    def __bool__(self) -> bool:
        'True if self else False'
        ...
    
    def __ceil__(self) -> float:
        'Return the ceiling as an Integral.'
        ...
    
    def __divmod__(self, value) -> typing.Tuple[float, float]:
        'Return divmod(self, value).'
        ...
    
    def __eq__(self, value) -> bool:
        'Return self==value.'
        ...
    
    def __float__(self) -> float:
        'float(self)'
        ...
    
    def __floor__(self) -> float:
        'Return the floor as an Integral.'
        ...
    
    def __floordiv__(self, value) -> int:
        'Return self//value.'
        ...
    
    def __format__(self, format_spec) -> str:
        'Formats the float according to format_spec.'
        ...
    
    def __ge__(self, value) -> bool:
        'Return self>=value.'
        ...
    
    def __getattribute__(self, name) -> typing.Any:
        'Return getattr(self, name).'
        ...
    
    @classmethod
    def __getformat__(cls, type, typestr) -> typing.Any:
        "You probably don't want to use this function.\n\n  typestr\n    Must be 'double' or 'float'.\n\nIt exists mainly to be used in Python's test suite.\n\nThis function returns whichever of 'unknown', 'IEEE, big-endian' or 'IEEE,\nlittle-endian' best describes the format of floating point numbers used by the\nC type named by typestr."
        ...
    
    def __getnewargs__(self) -> typing.Tuple[float]:
        ...
    
    def __gt__(self, value) -> bool:
        'Return self>value.'
        ...
    
    def __hash__(self) -> int:
        'Return hash(self).'
        ...
    
    def __init__(self, *args, **kwargs) -> None:
        'Convert a string or number to a floating point number, if possible.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    def __int__(self) -> int:
        'int(self)'
        ...
    
    def __le__(self, value) -> bool:
        'Return self<=value.'
        ...
    
    def __lt__(self, value) -> bool:
        'Return self<value.'
        ...
    
    def __mod__(self, value) -> float:
        'Return self%value.'
        ...
    
    def __mul__(self, value) -> float:
        'Return self*value.'
        ...
    
    def __ne__(self, value) -> bool:
        'Return self!=value.'
        ...
    
    def __neg__(self) -> float:
        '-self'
        ...
    
    def __pos__(self) -> float:
        '+self'
        ...
    
    def __pow__(self, value, mod) -> float:
        'Return pow(self, value, mod).'
        ...
    
    def __radd__(self, value) -> float:
        'Return value+self.'
        ...
    
    def __rdivmod__(self, value) -> typing.Tuple[float, float]:
        'Return divmod(value, self).'
        ...
    
    def __repr__(self) -> str:
        'Return repr(self).'
        ...
    
    def __rfloordiv__(self, value) -> float:
        'Return value//self.'
        ...
    
    def __rmod__(self, value) -> float:
        'Return value%self.'
        ...
    
    def __rmul__(self, value) -> float:
        'Return value*self.'
        ...
    
    def __round__(self, ndigits) -> float:
        'Return the Integral closest to x, rounding half toward even.\n\nWhen an argument is passed, work like built-in round(x, ndigits).'
        ...
    
    def __rpow__(self, value, mod) -> float:
        'Return pow(value, self, mod).'
        ...
    
    def __rsub__(self, value) -> float:
        'Return value-self.'
        ...
    
    def __rtruediv__(self, value) -> float:
        'Return value/self.'
        ...
    
    @classmethod
    def __setformat__(cls, type, typestr, fmt) -> typing.Any:
        "You probably don't want to use this function.\n\n  typestr\n    Must be 'double' or 'float'.\n  fmt\n    Must be one of 'unknown', 'IEEE, big-endian' or 'IEEE, little-endian',\n    and in addition can only be one of the latter two if it appears to\n    match the underlying C reality.\n\nIt exists mainly to be used in Python's test suite.\n\nOverride the automatic determination of C-level floating point type.\nThis affects how floats are converted to and from binary strings."
        ...
    
    def __sub__(self, value) -> float:
        'Return self-value.'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __truediv__(self, value) -> float:
        'Return self/value.'
        ...
    
    def __trunc__(self) -> float:
        'Return the Integral closest to x between 0 and x.'
        ...
    
    def as_integer_ratio(self) -> typing.Any:
        'Return integer ratio.\n\nReturn a pair of integers, whose ratio is exactly equal to the original float\nand with a positive denominator.\n\nRaise OverflowError on infinities and a ValueError on NaNs.\n\n>>> (10.0).as_integer_ratio()\n(10, 1)\n>>> (0.0).as_integer_ratio()\n(0, 1)\n>>> (-.25).as_integer_ratio()\n(-1, 4)'
        ...
    
    def conjugate(self) -> typing.Any:
        'Return self, the complex conjugate of any float.'
        ...
    
    @classmethod
    def fromhex(cls, type, string) -> typing.Any:
        "Create a floating-point number from a hexadecimal string.\n\n>>> float.fromhex('0x1.ffffp10')\n2047.984375\n>>> float.fromhex('-0x1p-1074')\n-5e-324"
        ...
    
    def hex(self) -> typing.Any:
        "Return a hexadecimal representation of a floating-point number.\n\n>>> (-0.1).hex()\n'-0x1.999999999999ap-4'\n>>> 3.14159.hex()\n'0x1.921f9f01b866ep+1'"
        ...
    
    @property
    def imag(self) -> typing.Any:
        'the imaginary part of a complex number'
        ...
    
    def is_integer(self) -> typing.Any:
        'Return True if the float is an integer.'
        ...
    
    @property
    def real(self) -> typing.Any:
        'the real part of a complex number'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

def format(value, format_spec) -> typing.Any:
    "Return value.__format__(format_spec)\n\nformat_spec defaults to the empty string.\nSee the Format Specification Mini-Language section of help('FORMATTING') for\ndetails."
    ...

class frozenset(object):
    'frozenset() -> empty frozenset object\nfrozenset(iterable) -> frozenset object\n\nBuild an immutable unordered collection of unique elements.'
    def __and__(self, value) -> frozenset:
        'Return self&value.'
        ...
    
    @classmethod
    def __class_getitem__(cls) -> typing.Any:
        'See PEP 585'
        ...
    
    def __contains__(self, value: typing.Any) -> bool:
        'x.__contains__(y) <==> y in x.'
        ...
    
    def __eq__(self, value) -> bool:
        'Return self==value.'
        ...
    
    def __ge__(self, value) -> bool:
        'Return self>=value.'
        ...
    
    def __getattribute__(self, name) -> typing.Any:
        'Return getattr(self, name).'
        ...
    
    def __gt__(self, value) -> bool:
        'Return self>value.'
        ...
    
    def __hash__(self) -> int:
        'Return hash(self).'
        ...
    
    def __init__(self) -> None:
        'frozenset() -> empty frozenset object\nfrozenset(iterable) -> frozenset object\n\nBuild an immutable unordered collection of unique elements.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    def __iter__(self) -> frozenset:
        'Implement iter(self).'
        ...
    
    def __le__(self, value) -> bool:
        'Return self<=value.'
        ...
    
    def __len__(self) -> int:
        'Return len(self).'
        ...
    
    def __lt__(self, value) -> bool:
        'Return self<value.'
        ...
    
    def __ne__(self, value) -> bool:
        'Return self!=value.'
        ...
    
    def __or__(self, value) -> frozenset:
        'Return self|value.'
        ...
    
    def __rand__(self, value) -> frozenset:
        'Return value&self.'
        ...
    
    def __reduce__(self) -> typing.Union[str, typing.Tuple[typing.Any, ...]]:
        'Return state information for pickling.'
        ...
    
    def __repr__(self) -> str:
        'Return repr(self).'
        ...
    
    def __ror__(self, value) -> frozenset:
        'Return value|self.'
        ...
    
    def __rsub__(self, value) -> frozenset:
        'Return value-self.'
        ...
    
    def __rxor__(self, value) -> frozenset:
        'Return value^self.'
        ...
    
    def __sizeof__(self) -> int:
        'S.__sizeof__() -> size of S in memory, in bytes'
        ...
    
    def __sub__(self, value) -> frozenset:
        'Return self-value.'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __xor__(self, value) -> frozenset:
        'Return self^value.'
        ...
    
    def copy(self) -> typing.Any:
        'Return a shallow copy of a set.'
        ...
    
    def difference(self) -> typing.Any:
        'Return the difference of two or more sets as a new set.\n\n(i.e. all elements that are in this set but not the others.)'
        ...
    
    def intersection(self) -> typing.Any:
        'Return the intersection of two sets as a new set.\n\n(i.e. all elements that are in both sets.)'
        ...
    
    def isdisjoint(self) -> typing.Any:
        'Return True if two sets have a null intersection.'
        ...
    
    def issubset(self) -> typing.Any:
        'Report whether another set contains this set.'
        ...
    
    def issuperset(self) -> typing.Any:
        'Report whether this set contains another set.'
        ...
    
    def symmetric_difference(self) -> typing.Any:
        'Return the symmetric difference of two sets as a new set.\n\n(i.e. all elements that are in exactly one of the sets.)'
        ...
    
    def union(self) -> typing.Any:
        'Return the union of sets as a new set.\n\n(i.e. all elements that are in either set.)'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

def getattr(object, name, default=...) -> typing.Any:
    "Get a named attribute from an object; getattr(x, 'y') is equivalent to x.y.\nWhen a default argument is given, it is returned when the attribute doesn't\nexist; without it, an exception is raised in that case."
    ...

def globals() -> typing.Any:
    "Return the dictionary containing the current scope's global variables.\n\nNOTE: Updates to this dictionary *will* affect name lookups in the current\nglobal scope and vice-versa."
    ...

def hasattr(obj, name) -> typing.Any:
    'Return whether the object has an attribute with the given name.\n\nThis is done by calling getattr(obj, name) and catching AttributeError.'
    ...

def hash(obj) -> typing.Any:
    'Return the hash value for the given object.\n\nTwo objects that compare equal must also have the same hash value, but the\nreverse is not necessarily true.'
    ...

def hex(number) -> typing.Any:
    "Return the hexadecimal representation of an integer.\n\n   >>> hex(12648430)\n   '0xc0ffee'"
    ...

def id(obj) -> typing.Any:
    "Return the identity of an object.\n\nThis is guaranteed to be unique among simultaneously existing objects.\n(CPython uses the object's memory address.)"
    ...

def input(prompt) -> typing.Any:
    'Read a string from standard input.  The trailing newline is stripped.\n\nThe prompt string, if given, is printed to standard output without a\ntrailing newline before reading input.\n\nIf the user hits EOF (*nix: Ctrl-D, Windows: Ctrl-Z+Return), raise EOFError.\nOn *nix systems, readline is used if available.'
    ...

class int(object):
    "int([x]) -> integer\nint(x, base=10) -> integer\n\nConvert a number or string to an integer, or return 0 if no arguments\nare given.  If x is a number, return x.__int__().  For floating point\nnumbers, this truncates towards zero.\n\nIf x is not a number or if base is given, then x must be a string,\nbytes, or bytearray instance representing an integer literal in the\ngiven base.  The literal can be preceded by '+' or '-' and be surrounded\nby whitespace.  The base defaults to 10.  Valid bases are 0 and 2-36.\nBase 0 means to interpret the base from the string as an integer literal.\n>>> int('0b100', base=0)\n4"
    def __abs__(self) -> int:
        'abs(self)'
        ...
    
    def __add__(self, value) -> int:
        'Return self+value.'
        ...
    
    def __and__(self, value) -> int:
        'Return self&value.'
        ...
    
    def __bool__(self) -> bool:
        'True if self else False'
        ...
    
    def __ceil__(self) -> int:
        'Ceiling of an Integral returns itself.'
        ...
    
    def __divmod__(self, value) -> typing.Tuple[int, int]:
        'Return divmod(self, value).'
        ...
    
    def __eq__(self, value) -> bool:
        'Return self==value.'
        ...
    
    def __float__(self) -> float:
        'float(self)'
        ...
    
    def __floor__(self) -> int:
        'Flooring an Integral returns itself.'
        ...
    
    def __floordiv__(self, value) -> int:
        'Return self//value.'
        ...
    
    def __format__(self, format_spec) -> str:
        ...
    
    def __ge__(self, value) -> bool:
        'Return self>=value.'
        ...
    
    def __getattribute__(self, name) -> typing.Any:
        'Return getattr(self, name).'
        ...
    
    def __getnewargs__(self) -> typing.Tuple[int]:
        ...
    
    def __gt__(self, value) -> bool:
        'Return self>value.'
        ...
    
    def __hash__(self) -> int:
        'Return hash(self).'
        ...
    
    def __index__(self) -> int:
        'Return self converted to an integer, if self is suitable for use as an index into a list.'
        ...
    
    def __init__(self, x=...) -> None:
        "int([x]) -> integer\nint(x, base=10) -> integer\n\nConvert a number or string to an integer, or return 0 if no arguments\nare given.  If x is a number, return x.__int__().  For floating point\nnumbers, this truncates towards zero.\n\nIf x is not a number or if base is given, then x must be a string,\nbytes, or bytearray instance representing an integer literal in the\ngiven base.  The literal can be preceded by '+' or '-' and be surrounded\nby whitespace.  The base defaults to 10.  Valid bases are 0 and 2-36.\nBase 0 means to interpret the base from the string as an integer literal.\n>>> int('0b100', base=0)\n4"
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    def __int__(self) -> int:
        'int(self)'
        ...
    
    def __invert__(self) -> int:
        '~self'
        ...
    
    def __le__(self, value) -> bool:
        'Return self<=value.'
        ...
    
    def __lshift__(self, value) -> int:
        'Return self<<value.'
        ...
    
    def __lt__(self, value) -> bool:
        'Return self<value.'
        ...
    
    def __mod__(self, value) -> int:
        'Return self%value.'
        ...
    
    def __mul__(self, value) -> int:
        'Return self*value.'
        ...
    
    def __ne__(self, value) -> bool:
        'Return self!=value.'
        ...
    
    def __neg__(self) -> int:
        '-self'
        ...
    
    def __or__(self, value) -> int:
        'Return self|value.'
        ...
    
    def __pos__(self) -> int:
        '+self'
        ...
    
    def __pow__(self, value, mod) -> int:
        'Return pow(self, value, mod).'
        ...
    
    def __radd__(self, value) -> int:
        'Return value+self.'
        ...
    
    def __rand__(self, value) -> int:
        'Return value&self.'
        ...
    
    def __rdivmod__(self, value) -> typing.Tuple[int, int]:
        'Return divmod(value, self).'
        ...
    
    def __repr__(self) -> str:
        'Return repr(self).'
        ...
    
    def __rfloordiv__(self, value) -> int:
        'Return value//self.'
        ...
    
    def __rlshift__(self, value) -> int:
        'Return value<<self.'
        ...
    
    def __rmod__(self, value) -> int:
        'Return value%self.'
        ...
    
    def __rmul__(self, value) -> int:
        'Return value*self.'
        ...
    
    def __ror__(self, value) -> int:
        'Return value|self.'
        ...
    
    def __round__(self, ndigits: int = ...) -> int:
        'Rounding an Integral returns itself.\n\nRounding with an ndigits argument also returns an integer.'
        ...
    
    def __rpow__(self, value, mod) -> int:
        'Return pow(value, self, mod).'
        ...
    
    def __rrshift__(self, value) -> int:
        'Return value>>self.'
        ...
    
    def __rshift__(self, value) -> int:
        'Return self>>value.'
        ...
    
    def __rsub__(self, value) -> int:
        'Return value-self.'
        ...
    
    def __rtruediv__(self, value) -> int:
        'Return value/self.'
        ...
    
    def __rxor__(self, value) -> int:
        'Return value^self.'
        ...
    
    def __sizeof__(self) -> int:
        'Returns size in memory, in bytes.'
        ...
    
    def __sub__(self, value) -> int:
        'Return self-value.'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __truediv__(self, value) -> float:
        'Return self/value.'
        ...
    
    def __trunc__(self) -> int:
        'Truncating an Integral returns itself.'
        ...
    
    def __xor__(self, value) -> int:
        'Return self^value.'
        ...
    
    def as_integer_ratio(self) -> typing.Any:
        'Return integer ratio.\n\nReturn a pair of integers, whose ratio is exactly equal to the original int\nand with a positive denominator.\n\n>>> (10).as_integer_ratio()\n(10, 1)\n>>> (-10).as_integer_ratio()\n(-10, 1)\n>>> (0).as_integer_ratio()\n(0, 1)'
        ...
    
    def bit_count(self) -> typing.Any:
        "Number of ones in the binary representation of the absolute value of self.\n\nAlso known as the population count.\n\n>>> bin(13)\n'0b1101'\n>>> (13).bit_count()\n3"
        ...
    
    def bit_length(self) -> typing.Any:
        "Number of bits necessary to represent self in binary.\n\n>>> bin(37)\n'0b100101'\n>>> (37).bit_length()\n6"
        ...
    
    def conjugate(self) -> typing.Any:
        'Returns self, the complex conjugate of any int.'
        ...
    
    @property
    def denominator(self) -> typing.Any:
        'the denominator of a rational number in lowest terms'
        ...
    
    @classmethod
    def from_bytes(cls, type, bytes, byteorder) -> typing.Any:
        "Return the integer represented by the given array of bytes.\n\n  bytes\n    Holds the array of bytes to convert.  The argument must either\n    support the buffer protocol or be an iterable object producing bytes.\n    Bytes and bytearray are examples of built-in objects that support the\n    buffer protocol.\n  byteorder\n    The byte order used to represent the integer.  If byteorder is 'big',\n    the most significant byte is at the beginning of the byte array.  If\n    byteorder is 'little', the most significant byte is at the end of the\n    byte array.  To request the native byte order of the host system, use\n    `sys.byteorder' as the byte order value.\n  signed\n    Indicates whether two's complement is used to represent the integer."
        ...
    
    @property
    def imag(self) -> typing.Any:
        'the imaginary part of a complex number'
        ...
    
    @property
    def numerator(self) -> typing.Any:
        'the numerator of a rational number in lowest terms'
        ...
    
    @property
    def real(self) -> typing.Any:
        'the real part of a complex number'
        ...
    
    def to_bytes(self, length, byteorder) -> typing.Any:
        "Return an array of bytes representing an integer.\n\n  length\n    Length of bytes object to use.  An OverflowError is raised if the\n    integer is not representable with the given number of bytes.\n  byteorder\n    The byte order used to represent the integer.  If byteorder is 'big',\n    the most significant byte is at the beginning of the byte array.  If\n    byteorder is 'little', the most significant byte is at the end of the\n    byte array.  To request the native byte order of the host system, use\n    `sys.byteorder' as the byte order value.\n  signed\n    Determines whether two's complement is used to represent the integer.\n    If signed is False and a negative integer is given, an OverflowError\n    is raised."
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

def isinstance(obj, class_or_tuple) -> typing.Any:
    'Return whether an object is an instance of a class or of a subclass thereof.\n\nA tuple, as in ``isinstance(x, (A, B, ...))``, may be given as the target to\ncheck against. This is equivalent to ``isinstance(x, A) or isinstance(x, B)\nor ...`` etc.'
    ...

def issubclass(cls, class_or_tuple) -> typing.Any:
    "Return whether 'cls' is derived from another class or is the same class.\n\nA tuple, as in ``issubclass(x, (A, B, ...))``, may be given as the target to\ncheck against. This is equivalent to ``issubclass(x, A) or issubclass(x, B)\nor ...``."
    ...

def iter(iterable) -> typing.Any:
    'iter(callable, sentinel) -> iterator\n\nGet an iterator from an object.  In the first form, the argument must\nsupply its own iterator, or be a sequence.\nIn the second form, the callable is called until it returns the sentinel.'
    ...

def len(obj) -> typing.Any:
    'Return the number of items in a container.'
    ...

class list(object):
    'Built-in mutable sequence.\n\nIf no argument is given, the constructor creates a new empty list.\nThe argument must be an iterable if specified.'
    def __add__(self, value) -> list:
        'Return self+value.'
        ...
    
    @classmethod
    def __class_getitem__(cls) -> typing.Any:
        'See PEP 585'
        ...
    
    def __contains__(self, key) -> bool:
        'Return key in self.'
        ...
    
    def __delitem__(self, key) -> None:
        'Delete self[key].'
        ...
    
    def __eq__(self, value) -> bool:
        'Return self==value.'
        ...
    
    def __ge__(self, value) -> bool:
        'Return self>=value.'
        ...
    
    def __getattribute__(self, name) -> typing.Any:
        'Return getattr(self, name).'
        ...
    
    def __getitem__(self, index: int) -> typing.Any:
        'x.__getitem__(y) <==> x[y]'
        ...
    
    def __gt__(self, value) -> bool:
        'Return self>value.'
        ...
    
    __hash__: typing.Any
    def __iadd__(self, value) -> None:
        'Implement self+=value.'
        ...
    
    def __imul__(self, value) -> None:
        'Implement self*=value.'
        ...
    
    def __init__(self, *args, **kwargs) -> None:
        'Built-in mutable sequence.\n\nIf no argument is given, the constructor creates a new empty list.\nThe argument must be an iterable if specified.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    def __iter__(self) -> list:
        'Implement iter(self).'
        ...
    
    def __le__(self, value) -> bool:
        'Return self<=value.'
        ...
    
    def __len__(self) -> int:
        'Return len(self).'
        ...
    
    def __lt__(self, value) -> bool:
        'Return self<value.'
        ...
    
    def __mul__(self, value) -> list:
        'Return self*value.'
        ...
    
    def __ne__(self, value) -> bool:
        'Return self!=value.'
        ...
    
    def __repr__(self) -> str:
        'Return repr(self).'
        ...
    
    def __reversed__(self) -> typing.Any:
        'Return a reverse iterator over the list.'
        ...
    
    def __rmul__(self, value) -> list:
        'Return value*self.'
        ...
    
    def __setitem__(self, key, value) -> None:
        'Set self[key] to value.'
        ...
    
    def __sizeof__(self) -> int:
        'Return the size of the list in memory, in bytes.'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def append(self, object) -> typing.Any:
        'Append object to the end of the list.'
        ...
    
    def clear(self) -> typing.Any:
        'Remove all items from list.'
        ...
    
    def copy(self) -> typing.Any:
        'Return a shallow copy of the list.'
        ...
    
    def count(self, value) -> typing.Any:
        'Return number of occurrences of value.'
        ...
    
    def extend(self, iterable) -> typing.Any:
        'Extend list by appending elements from the iterable.'
        ...
    
    def index(self, value, start, stop) -> typing.Any:
        'Return first index of value.\n\nRaises ValueError if the value is not present.'
        ...
    
    def insert(self, index, object) -> typing.Any:
        'Insert object before index.'
        ...
    
    def pop(self, index) -> typing.Any:
        'Remove and return item at index (default last).\n\nRaises IndexError if list is empty or index is out of range.'
        ...
    
    def remove(self, value) -> typing.Any:
        'Remove first occurrence of value.\n\nRaises ValueError if the value is not present.'
        ...
    
    def reverse(self) -> typing.Any:
        'Reverse *IN PLACE*.'
        ...
    
    def sort(self) -> typing.Any:
        'Sort the list in ascending order and return None.\n\nThe sort is in-place (i.e. the list itself is modified) and stable (i.e. the\norder of two equal elements is maintained).\n\nIf a key function is given, apply it once to each list item and sort them,\nascending or descending, according to their function values.\n\nThe reverse flag can be set to sort in descending order.'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

def locals() -> typing.Any:
    "Return a dictionary containing the current scope's local variables.\n\nNOTE: Whether or not updates to this dictionary will affect name lookups in\nthe local scope and vice-versa is *implementation dependent* and not\ncovered by any backwards compatibility guarantees."
    ...

class map(object):
    'map(func, *iterables) --> map object\n\nMake an iterator that computes the function using arguments from\neach of the iterables.  Stops when the shortest iterable is exhausted.'
    def __getattribute__(self, name) -> typing.Any:
        'Return getattr(self, name).'
        ...
    
    def __init__(self, func, *iterables) -> None:
        'map(func, *iterables) --> map object\n\nMake an iterator that computes the function using arguments from\neach of the iterables.  Stops when the shortest iterable is exhausted.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    def __iter__(self) -> map:
        'Implement iter(self).'
        ...
    
    def __next__(self) -> typing.Any:
        'Implement next(self).'
        ...
    
    def __reduce__(self) -> typing.Union[str, typing.Tuple[typing.Any, ...]]:
        'Return state information for pickling.'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

def max(iterable, *, default=..., key=...) -> typing.Any:
    'max(arg1, arg2, *args, *[, key=func]) -> value\n\nWith a single iterable argument, return its biggest item. The\ndefault keyword-only argument specifies an object to return if\nthe provided iterable is empty.\nWith two or more arguments, return the largest argument.'
    ...

class memoryview(object):
    'Create a new memoryview object which references the given object.'
    def __delitem__(self, key) -> None:
        'Delete self[key].'
        ...
    
    def __enter__(self) -> typing.Any:
        ...
    
    def __eq__(self, value) -> bool:
        'Return self==value.'
        ...
    
    def __exit__(self) -> typing.Any:
        ...
    
    def __ge__(self, value) -> bool:
        'Return self>=value.'
        ...
    
    def __getattribute__(self, name) -> typing.Any:
        'Return getattr(self, name).'
        ...
    
    def __getitem__(self, key) -> typing.Any:
        'Return self[key].'
        ...
    
    def __gt__(self, value) -> bool:
        'Return self>value.'
        ...
    
    def __hash__(self) -> int:
        'Return hash(self).'
        ...
    
    def __init__(self, *args, **kwargs) -> None:
        'Create a new memoryview object which references the given object.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    def __iter__(self) -> memoryview:
        'Implement iter(self).'
        ...
    
    def __le__(self, value) -> bool:
        'Return self<=value.'
        ...
    
    def __len__(self) -> int:
        'Return len(self).'
        ...
    
    def __lt__(self, value) -> bool:
        'Return self<value.'
        ...
    
    def __ne__(self, value) -> bool:
        'Return self!=value.'
        ...
    
    def __repr__(self) -> str:
        'Return repr(self).'
        ...
    
    def __setitem__(self, key, value) -> None:
        'Set self[key] to value.'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    @property
    def c_contiguous(self) -> typing.Any:
        'A bool indicating whether the memory is C contiguous.'
        ...
    
    def cast(self) -> typing.Any:
        'Cast a memoryview to a new format or shape.'
        ...
    
    @property
    def contiguous(self) -> typing.Any:
        'A bool indicating whether the memory is contiguous.'
        ...
    
    @property
    def f_contiguous(self) -> typing.Any:
        'A bool indicating whether the memory is Fortran contiguous.'
        ...
    
    @property
    def format(self) -> typing.Any:
        'A string containing the format (in struct module style)\n for each element in the view.'
        ...
    
    def hex(self) -> typing.Any:
        "Return the data in the buffer as a str of hexadecimal numbers.\n\n  sep\n    An optional single character or byte to separate hex bytes.\n  bytes_per_sep\n    How many bytes between separators.  Positive values count from the\n    right, negative values count from the left.\n\nExample:\n>>> value = memoryview(b'\\xb9\\x01\\xef')\n>>> value.hex()\n'b901ef'\n>>> value.hex(':')\n'b9:01:ef'\n>>> value.hex(':', 2)\n'b9:01ef'\n>>> value.hex(':', -2)\n'b901:ef'"
        ...
    
    @property
    def itemsize(self) -> typing.Any:
        'The size in bytes of each element of the memoryview.'
        ...
    
    @property
    def nbytes(self) -> typing.Any:
        'The amount of space in bytes that the array would use in\n a contiguous representation.'
        ...
    
    @property
    def ndim(self) -> typing.Any:
        'An integer indicating how many dimensions of a multi-dimensional\n array the memory represents.'
        ...
    
    @property
    def obj(self) -> typing.Any:
        'The underlying object of the memoryview.'
        ...
    
    @property
    def readonly(self) -> typing.Any:
        'A bool indicating whether the memory is read only.'
        ...
    
    def release(self) -> typing.Any:
        'Release the underlying buffer exposed by the memoryview object.'
        ...
    
    @property
    def shape(self) -> typing.Any:
        'A tuple of ndim integers giving the shape of the memory\n as an N-dimensional array.'
        ...
    
    @property
    def strides(self) -> typing.Any:
        'A tuple of ndim integers giving the size in bytes to access\n each element for each dimension of the array.'
        ...
    
    @property
    def suboffsets(self) -> typing.Any:
        'A tuple of integers used internally for PIL-style arrays.'
        ...
    
    def tobytes(self, order) -> typing.Any:
        "Return the data in the buffer as a byte string.\n\nOrder can be {'C', 'F', 'A'}. When order is 'C' or 'F', the data of the\noriginal array is converted to C or Fortran order. For contiguous views,\n'A' returns an exact copy of the physical memory. In particular, in-memory\nFortran order is preserved. For non-contiguous views, the data is converted\nto C first. order=None is the same as order='C'."
        ...
    
    def tolist(self) -> typing.Any:
        'Return the data in the buffer as a list of elements.'
        ...
    
    def toreadonly(self) -> typing.Any:
        'Return a readonly version of the memoryview.'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

def min(iterable, *, default=..., key=...) -> typing.Any:
    'min(arg1, arg2, *args, *[, key=func]) -> value\n\nWith a single iterable argument, return its smallest item. The\ndefault keyword-only argument specifies an object to return if\nthe provided iterable is empty.\nWith two or more arguments, return the smallest argument.'
    ...

def next(iterator, default=...) -> typing.Any:
    'Return the next item from the iterator. If default is given and the iterator\nis exhausted, it is returned instead of raising StopIteration.'
    ...

class object:
    'The base class of the class hierarchy.\n\nWhen called, it accepts no arguments and returns a new featureless\ninstance that has no instance attributes and cannot be given any.\n'
    __class__: type
    def __delattr__(self, name) -> None:
        'Implement delattr(self, name).'
        ...
    
    def __dir__(self) -> typing.Iterable[str]:
        'Default dir() implementation.'
        ...
    
    def __eq__(self, value) -> bool:
        'Return self==value.'
        ...
    
    def __format__(self, format_spec) -> str:
        'Default object formatter.'
        ...
    
    def __ge__(self, value) -> bool:
        'Return self>=value.'
        ...
    
    def __getattribute__(self, name) -> typing.Any:
        'Return getattr(self, name).'
        ...
    
    def __gt__(self, value) -> bool:
        'Return self>value.'
        ...
    
    def __hash__(self) -> int:
        'Return hash(self).'
        ...
    
    def __init__(self) -> None:
        'The base class of the class hierarchy.\n\nWhen called, it accepts no arguments and returns a new featureless\ninstance that has no instance attributes and cannot be given any.\n'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    def __le__(self, value) -> bool:
        'Return self<=value.'
        ...
    
    def __lt__(self, value) -> bool:
        'Return self<value.'
        ...
    
    def __ne__(self, value) -> bool:
        'Return self!=value.'
        ...
    
    def __reduce__(self) -> typing.Union[str, typing.Tuple[typing.Any, ...]]:
        'Helper for pickle.'
        ...
    
    def __reduce_ex__(self, protocol) -> typing.Union[str, typing.Tuple[typing.Any, ...]]:
        'Helper for pickle.'
        ...
    
    def __repr__(self) -> str:
        'Return repr(self).'
        ...
    
    def __setattr__(self, name, value) -> None:
        'Implement setattr(self, name, value).'
        ...
    
    def __sizeof__(self) -> int:
        'Size of object in memory, in bytes.'
        ...
    
    def __str__(self) -> str:
        'Return str(self).'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

def oct(number) -> typing.Any:
    "Return the octal representation of an integer.\n\n   >>> oct(342391)\n   '0o1234567'"
    ...

def open(file, mode, buffering, encoding, errors, newline, closefd, opener) -> typing.Any:
    'Open file and return a stream.  Raise OSError upon failure.\n\nfile is either a text or byte string giving the name (and the path\nif the file isn\'t in the current working directory) of the file to\nbe opened or an integer file descriptor of the file to be\nwrapped. (If a file descriptor is given, it is closed when the\nreturned I/O object is closed, unless closefd is set to False.)\n\nmode is an optional string that specifies the mode in which the file\nis opened. It defaults to \'r\' which means open for reading in text\nmode.  Other common values are \'w\' for writing (truncating the file if\nit already exists), \'x\' for creating and writing to a new file, and\n\'a\' for appending (which on some Unix systems, means that all writes\nappend to the end of the file regardless of the current seek position).\nIn text mode, if encoding is not specified the encoding used is platform\ndependent: locale.getpreferredencoding(False) is called to get the\ncurrent locale encoding. (For reading and writing raw bytes use binary\nmode and leave encoding unspecified.) The available modes are:\n\n========= ===============================================================\nCharacter Meaning\n--------- ---------------------------------------------------------------\n\'r\'       open for reading (default)\n\'w\'       open for writing, truncating the file first\n\'x\'       create a new file and open it for writing\n\'a\'       open for writing, appending to the end of the file if it exists\n\'b\'       binary mode\n\'t\'       text mode (default)\n\'+\'       open a disk file for updating (reading and writing)\n\'U\'       universal newline mode (deprecated)\n========= ===============================================================\n\nThe default mode is \'rt\' (open for reading text). For binary random\naccess, the mode \'w+b\' opens and truncates the file to 0 bytes, while\n\'r+b\' opens the file without truncation. The \'x\' mode implies \'w\' and\nraises an `FileExistsError` if the file already exists.\n\nPython distinguishes between files opened in binary and text modes,\neven when the underlying operating system doesn\'t. Files opened in\nbinary mode (appending \'b\' to the mode argument) return contents as\nbytes objects without any decoding. In text mode (the default, or when\n\'t\' is appended to the mode argument), the contents of the file are\nreturned as strings, the bytes having been first decoded using a\nplatform-dependent encoding or using the specified encoding if given.\n\n\'U\' mode is deprecated and will raise an exception in future versions\nof Python.  It has no effect in Python 3.  Use newline to control\nuniversal newlines mode.\n\nbuffering is an optional integer used to set the buffering policy.\nPass 0 to switch buffering off (only allowed in binary mode), 1 to select\nline buffering (only usable in text mode), and an integer > 1 to indicate\nthe size of a fixed-size chunk buffer.  When no buffering argument is\ngiven, the default buffering policy works as follows:\n\n* Binary files are buffered in fixed-size chunks; the size of the buffer\n  is chosen using a heuristic trying to determine the underlying device\'s\n  "block size" and falling back on `io.DEFAULT_BUFFER_SIZE`.\n  On many systems, the buffer will typically be 4096 or 8192 bytes long.\n\n* "Interactive" text files (files for which isatty() returns True)\n  use line buffering.  Other text files use the policy described above\n  for binary files.\n\nencoding is the name of the encoding used to decode or encode the\nfile. This should only be used in text mode. The default encoding is\nplatform dependent, but any encoding supported by Python can be\npassed.  See the codecs module for the list of supported encodings.\n\nerrors is an optional string that specifies how encoding errors are to\nbe handled---this argument should not be used in binary mode. Pass\n\'strict\' to raise a ValueError exception if there is an encoding error\n(the default of None has the same effect), or pass \'ignore\' to ignore\nerrors. (Note that ignoring encoding errors can lead to data loss.)\nSee the documentation for codecs.register or run \'help(codecs.Codec)\'\nfor a list of the permitted encoding error strings.\n\nnewline controls how universal newlines works (it only applies to text\nmode). It can be None, \'\', \'\\n\', \'\\r\', and \'\\r\\n\'.  It works as\nfollows:\n\n* On input, if newline is None, universal newlines mode is\n  enabled. Lines in the input can end in \'\\n\', \'\\r\', or \'\\r\\n\', and\n  these are translated into \'\\n\' before being returned to the\n  caller. If it is \'\', universal newline mode is enabled, but line\n  endings are returned to the caller untranslated. If it has any of\n  the other legal values, input lines are only terminated by the given\n  string, and the line ending is returned to the caller untranslated.\n\n* On output, if newline is None, any \'\\n\' characters written are\n  translated to the system default line separator, os.linesep. If\n  newline is \'\' or \'\\n\', no translation takes place. If newline is any\n  of the other legal values, any \'\\n\' characters written are translated\n  to the given string.\n\nIf closefd is False, the underlying file descriptor will be kept open\nwhen the file is closed. This does not work when a file name is given\nand must be True in that case.\n\nA custom opener can be used by passing a callable as *opener*. The\nunderlying file descriptor for the file object is then obtained by\ncalling *opener* with (*file*, *flags*). *opener* must return an open\nfile descriptor (passing os.open as *opener* results in functionality\nsimilar to passing None).\n\nopen() returns a file object whose type depends on the mode, and\nthrough which the standard file operations such as reading and writing\nare performed. When open() is used to open a file in a text mode (\'w\',\n\'r\', \'wt\', \'rt\', etc.), it returns a TextIOWrapper. When used to open\na file in a binary mode, the returned class varies: in read binary\nmode, it returns a BufferedReader; in write binary and append binary\nmodes, it returns a BufferedWriter, and in read/write mode, it returns\na BufferedRandom.\n\nIt is also possible to use a string or bytearray as a file for both\nreading and writing. For strings StringIO can be used like a file\nopened in a text mode, and for bytes a BytesIO can be used like a file\nopened in a binary mode.'
    ...

def ord(c) -> typing.Any:
    'Return the Unicode code point for a one-character string.'
    ...

def pow(base, exp, mod) -> typing.Any:
    'Equivalent to base**exp with 2 arguments or base**exp % mod with 3 arguments\n\nSome types, such as ints, are able to use a more efficient algorithm when\ninvoked using the three argument form.'
    ...

def print() -> typing.Any:
    'Prints the values to a stream, or to sys.stdout by default.\nOptional keyword arguments:\nfile:  a file-like object (stream); defaults to the current sys.stdout.\nsep:   string inserted between values, default a space.\nend:   string appended after the last value, default a newline.\nflush: whether to forcibly flush the stream.'
    ...

class property(object):
    'Property attribute.\n\n  fget\n    function to be used for getting an attribute value\n  fset\n    function to be used for setting an attribute value\n  fdel\n    function to be used for del\'ing an attribute\n  doc\n    docstring\n\nTypical use is to define a managed attribute x:\n\nclass C(object):\n    def getx(self): return self._x\n    def setx(self, value): self._x = value\n    def delx(self): del self._x\n    x = property(getx, setx, delx, "I\'m the \'x\' property.")\n\nDecorators make defining new properties or modifying existing ones easy:\n\nclass C(object):\n    @property\n    def x(self):\n        "I am the \'x\' property."\n        return self._x\n    @x.setter\n    def x(self, value):\n        self._x = value\n    @x.deleter\n    def x(self):\n        del self._x'
    def __delete__(self, instance) -> typing.Any:
        'Delete an attribute of instance.'
        ...
    
    def __get__(self, instance, owner) -> property:
        'Return an attribute of instance, which is of type owner.'
        ...
    
    def __getattribute__(self, name) -> typing.Any:
        'Return getattr(self, name).'
        ...
    
    def __init__(self, *args, **kwargs) -> None:
        'Property attribute.\n\n  fget\n    function to be used for getting an attribute value\n  fset\n    function to be used for setting an attribute value\n  fdel\n    function to be used for del\'ing an attribute\n  doc\n    docstring\n\nTypical use is to define a managed attribute x:\n\nclass C(object):\n    def getx(self): return self._x\n    def setx(self, value): self._x = value\n    def delx(self): del self._x\n    x = property(getx, setx, delx, "I\'m the \'x\' property.")\n\nDecorators make defining new properties or modifying existing ones easy:\n\nclass C(object):\n    @property\n    def x(self):\n        "I am the \'x\' property."\n        return self._x\n    @x.setter\n    def x(self, value):\n        self._x = value\n    @x.deleter\n    def x(self):\n        del self._x'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @property
    def __isabstractmethod__(self) -> typing.Any:
        ...
    
    def __set__(self, instance, value) -> None:
        'Set an attribute of instance to value.'
        ...
    
    def __set_name__(self) -> typing.Any:
        'Method to set name of a property.'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def deleter(self) -> typing.Any:
        'Descriptor to obtain a copy of the property with a different deleter.'
        ...
    
    @property
    def fdel(self) -> typing.Any:
        ...
    
    @property
    def fget(self) -> typing.Any:
        ...
    
    @property
    def fset(self) -> typing.Any:
        ...
    
    def getter(self) -> typing.Any:
        'Descriptor to obtain a copy of the property with a different getter.'
        ...
    
    def setter(self) -> typing.Any:
        'Descriptor to obtain a copy of the property with a different setter.'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class range(object):
    'range(stop) -> range object\nrange(start, stop[, step]) -> range object\n\nReturn an object that produces a sequence of integers from start (inclusive)\nto stop (exclusive) by step.  range(i, j) produces i, i+1, i+2, ..., j-1.\nstart defaults to 0, and stop is omitted!  range(4) produces 0, 1, 2, 3.\nThese are exactly the valid indices for a list of 4 elements.\nWhen step is given, it specifies the increment (or decrement).'
    def __bool__(self) -> bool:
        'True if self else False'
        ...
    
    def __contains__(self, key) -> bool:
        'Return key in self.'
        ...
    
    def __eq__(self, value) -> bool:
        'Return self==value.'
        ...
    
    def __ge__(self, value) -> bool:
        'Return self>=value.'
        ...
    
    def __getattribute__(self, name) -> typing.Any:
        'Return getattr(self, name).'
        ...
    
    def __getitem__(self, key) -> typing.Any:
        'Return self[key].'
        ...
    
    def __gt__(self, value) -> bool:
        'Return self>value.'
        ...
    
    def __hash__(self) -> int:
        'Return hash(self).'
        ...
    
    def __init__(self, stop) -> None:
        'range(stop) -> range object\nrange(start, stop[, step]) -> range object\n\nReturn an object that produces a sequence of integers from start (inclusive)\nto stop (exclusive) by step.  range(i, j) produces i, i+1, i+2, ..., j-1.\nstart defaults to 0, and stop is omitted!  range(4) produces 0, 1, 2, 3.\nThese are exactly the valid indices for a list of 4 elements.\nWhen step is given, it specifies the increment (or decrement).'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    def __iter__(self) -> range:
        'Implement iter(self).'
        ...
    
    def __le__(self, value) -> bool:
        'Return self<=value.'
        ...
    
    def __len__(self) -> int:
        'Return len(self).'
        ...
    
    def __lt__(self, value) -> bool:
        'Return self<value.'
        ...
    
    def __ne__(self, value) -> bool:
        'Return self!=value.'
        ...
    
    def __reduce__(self) -> typing.Union[str, typing.Tuple[typing.Any, ...]]:
        ...
    
    def __repr__(self) -> str:
        'Return repr(self).'
        ...
    
    def __reversed__(self) -> typing.Any:
        'Return a reverse iterator.'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def count(self, value) -> int:
        'rangeobject.count(value) -> integer -- return number of occurrences of value'
        ...
    
    def index(self, value) -> int:
        'rangeobject.index(value) -> integer -- return index of value.\nRaise ValueError if the value is not present.'
        ...
    
    @property
    def start(self) -> typing.Any:
        ...
    
    @property
    def step(self) -> typing.Any:
        ...
    
    @property
    def stop(self) -> typing.Any:
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

def repr(obj) -> typing.Any:
    'Return the canonical string representation of the object.\n\nFor many object types, including most builtins, eval(repr(obj)) == obj.'
    ...

class reversed(object):
    'Return a reverse iterator over the values of the given sequence.'
    def __getattribute__(self, name) -> typing.Any:
        'Return getattr(self, name).'
        ...
    
    def __init__(self, *args, **kwargs) -> None:
        'Return a reverse iterator over the values of the given sequence.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    def __iter__(self) -> reversed:
        'Implement iter(self).'
        ...
    
    def __length_hint__(self) -> int:
        'Private method returning an estimate of len(list(it)).'
        ...
    
    def __next__(self) -> typing.Any:
        'Implement next(self).'
        ...
    
    def __reduce__(self) -> typing.Union[str, typing.Tuple[typing.Any, ...]]:
        'Return state information for pickling.'
        ...
    
    def __setstate__(self, state: typing.Any) -> None:
        'Set state information for unpickling.'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

def round(number, ndigits) -> typing.Any:
    'Round a number to a given precision in decimal digits.\n\nThe return value is an integer if ndigits is omitted or None.  Otherwise\nthe return value has the same type as the number.  ndigits may be negative.'
    ...

class set(object):
    'set() -> new empty set object\nset(iterable) -> new set object\n\nBuild an unordered collection of unique elements.'
    def __and__(self, value) -> set:
        'Return self&value.'
        ...
    
    @classmethod
    def __class_getitem__(cls) -> typing.Any:
        'See PEP 585'
        ...
    
    def __contains__(self, value: typing.Any) -> bool:
        'x.__contains__(y) <==> y in x.'
        ...
    
    def __eq__(self, value) -> bool:
        'Return self==value.'
        ...
    
    def __ge__(self, value) -> bool:
        'Return self>=value.'
        ...
    
    def __getattribute__(self, name) -> typing.Any:
        'Return getattr(self, name).'
        ...
    
    def __gt__(self, value) -> bool:
        'Return self>value.'
        ...
    
    __hash__: typing.Any
    def __iand__(self, value) -> None:
        'Return self&=value.'
        ...
    
    def __init__(self) -> None:
        'set() -> new empty set object\nset(iterable) -> new set object\n\nBuild an unordered collection of unique elements.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    def __ior__(self, value) -> None:
        'Return self|=value.'
        ...
    
    def __isub__(self, value) -> None:
        'Return self-=value.'
        ...
    
    def __iter__(self) -> set:
        'Implement iter(self).'
        ...
    
    def __ixor__(self, value) -> None:
        'Return self^=value.'
        ...
    
    def __le__(self, value) -> bool:
        'Return self<=value.'
        ...
    
    def __len__(self) -> int:
        'Return len(self).'
        ...
    
    def __lt__(self, value) -> bool:
        'Return self<value.'
        ...
    
    def __ne__(self, value) -> bool:
        'Return self!=value.'
        ...
    
    def __or__(self, value) -> set:
        'Return self|value.'
        ...
    
    def __rand__(self, value) -> set:
        'Return value&self.'
        ...
    
    def __reduce__(self) -> typing.Union[str, typing.Tuple[typing.Any, ...]]:
        'Return state information for pickling.'
        ...
    
    def __repr__(self) -> str:
        'Return repr(self).'
        ...
    
    def __ror__(self, value) -> set:
        'Return value|self.'
        ...
    
    def __rsub__(self, value) -> set:
        'Return value-self.'
        ...
    
    def __rxor__(self, value) -> set:
        'Return value^self.'
        ...
    
    def __sizeof__(self) -> int:
        'S.__sizeof__() -> size of S in memory, in bytes'
        ...
    
    def __sub__(self, value) -> set:
        'Return self-value.'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __xor__(self, value) -> set:
        'Return self^value.'
        ...
    
    def add(self) -> typing.Any:
        'Add an element to a set.\n\nThis has no effect if the element is already present.'
        ...
    
    def clear(self) -> typing.Any:
        'Remove all elements from this set.'
        ...
    
    def copy(self) -> typing.Any:
        'Return a shallow copy of a set.'
        ...
    
    def difference(self) -> typing.Any:
        'Return the difference of two or more sets as a new set.\n\n(i.e. all elements that are in this set but not the others.)'
        ...
    
    def difference_update(self) -> typing.Any:
        'Remove all elements of another set from this set.'
        ...
    
    def discard(self) -> typing.Any:
        'Remove an element from a set if it is a member.\n\nIf the element is not a member, do nothing.'
        ...
    
    def intersection(self) -> typing.Any:
        'Return the intersection of two sets as a new set.\n\n(i.e. all elements that are in both sets.)'
        ...
    
    def intersection_update(self) -> typing.Any:
        'Update a set with the intersection of itself and another.'
        ...
    
    def isdisjoint(self) -> typing.Any:
        'Return True if two sets have a null intersection.'
        ...
    
    def issubset(self) -> typing.Any:
        'Report whether another set contains this set.'
        ...
    
    def issuperset(self) -> typing.Any:
        'Report whether this set contains another set.'
        ...
    
    def pop(self) -> typing.Any:
        'Remove and return an arbitrary set element.\nRaises KeyError if the set is empty.'
        ...
    
    def remove(self) -> typing.Any:
        'Remove an element from a set; it must be a member.\n\nIf the element is not a member, raise a KeyError.'
        ...
    
    def symmetric_difference(self) -> typing.Any:
        'Return the symmetric difference of two sets as a new set.\n\n(i.e. all elements that are in exactly one of the sets.)'
        ...
    
    def symmetric_difference_update(self) -> typing.Any:
        'Update a set with the symmetric difference of itself and another.'
        ...
    
    def union(self) -> typing.Any:
        'Return the union of sets as a new set.\n\n(i.e. all elements that are in either set.)'
        ...
    
    def update(self) -> typing.Any:
        'Update a set with the union of itself and others.'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

def setattr(obj, name, value) -> typing.Any:
    "Sets the named attribute on the given object to the specified value.\n\nsetattr(x, 'y', v) is equivalent to ``x.y = v''"
    ...

class slice(object):
    'slice(stop)\nslice(start, stop[, step])\n\nCreate a slice object.  This is used for extended slicing (e.g. a[0:10:2]).'
    def __eq__(self, value) -> bool:
        'Return self==value.'
        ...
    
    def __ge__(self, value) -> bool:
        'Return self>=value.'
        ...
    
    def __getattribute__(self, name) -> typing.Any:
        'Return getattr(self, name).'
        ...
    
    def __gt__(self, value) -> bool:
        'Return self>value.'
        ...
    
    __hash__: typing.Any
    def __init__(self, stop) -> None:
        'slice(stop)\nslice(start, stop[, step])\n\nCreate a slice object.  This is used for extended slicing (e.g. a[0:10:2]).'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    def __le__(self, value) -> bool:
        'Return self<=value.'
        ...
    
    def __lt__(self, value) -> bool:
        'Return self<value.'
        ...
    
    def __ne__(self, value) -> bool:
        'Return self!=value.'
        ...
    
    def __reduce__(self) -> typing.Union[str, typing.Tuple[typing.Any, ...]]:
        'Return state information for pickling.'
        ...
    
    def __repr__(self) -> str:
        'Return repr(self).'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def indices(self, len) -> typing.Tuple[typing.Any, ...]:
        'S.indices(len) -> (start, stop, stride)\n\nAssuming a sequence of length len, calculate the start and stop\nindices, and the stride length of the extended slice described by\nS. Out of bounds indices are clipped in a manner consistent with the\nhandling of normal slices.'
        ...
    
    @property
    def start(self) -> typing.Any:
        ...
    
    @property
    def step(self) -> typing.Any:
        ...
    
    @property
    def stop(self) -> typing.Any:
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

def sorted(iterable) -> typing.Any:
    'Return a new list containing all items from the iterable in ascending order.\n\nA custom key function can be supplied to customize the sort order, and the\nreverse flag can be set to request the result in descending order.'
    ...

class staticmethod(object):
    'staticmethod(function) -> method\n\nConvert a function to be a static method.\n\nA static method does not receive an implicit first argument.\nTo declare a static method, use this idiom:\n\n     class C:\n         @staticmethod\n         def f(arg1, arg2, ...):\n             ...\n\nIt can be called either on the class (e.g. C.f()) or on an instance\n(e.g. C().f()). Both the class and the instance are ignored, and\nneither is passed implicitly as the first argument to the method.\n\nStatic methods in Python are similar to those found in Java or C++.\nFor a more advanced concept, see the classmethod builtin.'
    def __call__(self, *args, **kwargs) -> typing.Any:
        'Call self as a function.'
        ...
    
    __dict__: typing.Dict[str, typing.Any]
    @property
    def __func__(self) -> typing.Any:
        ...
    
    def __get__(self, instance, owner) -> staticmethod:
        'Return an attribute of instance, which is of type owner.'
        ...
    
    def __init__(self, function) -> None:
        'staticmethod(function) -> method\n\nConvert a function to be a static method.\n\nA static method does not receive an implicit first argument.\nTo declare a static method, use this idiom:\n\n     class C:\n         @staticmethod\n         def f(arg1, arg2, ...):\n             ...\n\nIt can be called either on the class (e.g. C.f()) or on an instance\n(e.g. C().f()). Both the class and the instance are ignored, and\nneither is passed implicitly as the first argument to the method.\n\nStatic methods in Python are similar to those found in Java or C++.\nFor a more advanced concept, see the classmethod builtin.'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    @property
    def __isabstractmethod__(self) -> typing.Any:
        ...
    
    def __repr__(self) -> str:
        'Return repr(self).'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    @property
    def __wrapped__(self) -> typing.Any:
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class str(object):
    "str(object='') -> str\nstr(bytes_or_buffer[, encoding[, errors]]) -> str\n\nCreate a new string object from the given object. If encoding or\nerrors is specified, then the object must expose a data buffer\nthat will be decoded using the given encoding and error handler.\nOtherwise, returns the result of object.__str__() (if defined)\nor repr(object).\nencoding defaults to sys.getdefaultencoding().\nerrors defaults to 'strict'."
    def __add__(self, value) -> str:
        'Return self+value.'
        ...
    
    def __contains__(self, key) -> bool:
        'Return key in self.'
        ...
    
    def __eq__(self, value) -> bool:
        'Return self==value.'
        ...
    
    def __format__(self, format_spec) -> str:
        'Return a formatted version of the string as described by format_spec.'
        ...
    
    def __ge__(self, value) -> bool:
        'Return self>=value.'
        ...
    
    def __getattribute__(self, name) -> typing.Any:
        'Return getattr(self, name).'
        ...
    
    def __getitem__(self, key) -> typing.Any:
        'Return self[key].'
        ...
    
    def __getnewargs__(self) -> typing.Tuple[str]:
        ...
    
    def __gt__(self, value) -> bool:
        'Return self>value.'
        ...
    
    def __hash__(self) -> int:
        'Return hash(self).'
        ...
    
    def __init__(self, object=...) -> None:
        "str(object='') -> str\nstr(bytes_or_buffer[, encoding[, errors]]) -> str\n\nCreate a new string object from the given object. If encoding or\nerrors is specified, then the object must expose a data buffer\nthat will be decoded using the given encoding and error handler.\nOtherwise, returns the result of object.__str__() (if defined)\nor repr(object).\nencoding defaults to sys.getdefaultencoding().\nerrors defaults to 'strict'."
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    def __iter__(self) -> str:
        'Implement iter(self).'
        ...
    
    def __le__(self, value) -> bool:
        'Return self<=value.'
        ...
    
    def __len__(self) -> int:
        'Return len(self).'
        ...
    
    def __lt__(self, value) -> bool:
        'Return self<value.'
        ...
    
    def __mod__(self, value) -> str:
        'Return self%value.'
        ...
    
    def __mul__(self, value) -> str:
        'Return self*value.'
        ...
    
    def __ne__(self, value) -> bool:
        'Return self!=value.'
        ...
    
    def __repr__(self) -> str:
        'Return repr(self).'
        ...
    
    def __rmod__(self, value) -> str:
        'Return value%self.'
        ...
    
    def __rmul__(self, value) -> str:
        'Return value*self.'
        ...
    
    def __sizeof__(self) -> int:
        'Return the size of the string in memory, in bytes.'
        ...
    
    def __str__(self) -> str:
        'Return str(self).'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def capitalize(self) -> typing.Any:
        'Return a capitalized version of the string.\n\nMore specifically, make the first character have upper case and the rest lower\ncase.'
        ...
    
    def casefold(self) -> typing.Any:
        'Return a version of the string suitable for caseless comparisons.'
        ...
    
    def center(self, width, fillchar) -> typing.Any:
        'Return a centered string of length width.\n\nPadding is done using the specified fill character (default is a space).'
        ...
    
    def count(self, sub, start=..., end=...) -> int:
        'S.count(sub[, start[, end]]) -> int\n\nReturn the number of non-overlapping occurrences of substring sub in\nstring S[start:end].  Optional arguments start and end are\ninterpreted as in slice notation.'
        ...
    
    def encode(self, encoding, errors) -> typing.Any:
        "Encode the string using the codec registered for encoding.\n\n  encoding\n    The encoding in which to encode the string.\n  errors\n    The error handling scheme to use for encoding errors.\n    The default is 'strict' meaning that encoding errors raise a\n    UnicodeEncodeError.  Other possible values are 'ignore', 'replace' and\n    'xmlcharrefreplace' as well as any other name registered with\n    codecs.register_error that can handle UnicodeEncodeErrors."
        ...
    
    def endswith(self, suffix, start=..., end=...) -> bool:
        'S.endswith(suffix[, start[, end]]) -> bool\n\nReturn True if S ends with the specified suffix, False otherwise.\nWith optional start, test S beginning at that position.\nWith optional end, stop comparing S at that position.\nsuffix can also be a tuple of strings to try.'
        ...
    
    def expandtabs(self, tabsize) -> typing.Any:
        'Return a copy where all tab characters are expanded using spaces.\n\nIf tabsize is not given, a tab size of 8 characters is assumed.'
        ...
    
    def find(self, sub, start=..., end=...) -> int:
        'S.find(sub[, start[, end]]) -> int\n\nReturn the lowest index in S where substring sub is found,\nsuch that sub is contained within S[start:end].  Optional\narguments start and end are interpreted as in slice notation.\n\nReturn -1 on failure.'
        ...
    
    def format(self, *args, **kwargs) -> str:
        "S.format(*args, **kwargs) -> str\n\nReturn a formatted version of S, using substitutions from args and kwargs.\nThe substitutions are identified by braces ('{' and '}')."
        ...
    
    def format_map(self, mapping) -> str:
        "S.format_map(mapping) -> str\n\nReturn a formatted version of S, using substitutions from mapping.\nThe substitutions are identified by braces ('{' and '}')."
        ...
    
    def index(self, sub, start=..., end=...) -> int:
        'S.index(sub[, start[, end]]) -> int\n\nReturn the lowest index in S where substring sub is found,\nsuch that sub is contained within S[start:end].  Optional\narguments start and end are interpreted as in slice notation.\n\nRaises ValueError when the substring is not found.'
        ...
    
    def isalnum(self) -> typing.Any:
        'Return True if the string is an alpha-numeric string, False otherwise.\n\nA string is alpha-numeric if all characters in the string are alpha-numeric and\nthere is at least one character in the string.'
        ...
    
    def isalpha(self) -> typing.Any:
        'Return True if the string is an alphabetic string, False otherwise.\n\nA string is alphabetic if all characters in the string are alphabetic and there\nis at least one character in the string.'
        ...
    
    def isascii(self) -> typing.Any:
        'Return True if all characters in the string are ASCII, False otherwise.\n\nASCII characters have code points in the range U+0000-U+007F.\nEmpty string is ASCII too.'
        ...
    
    def isdecimal(self) -> typing.Any:
        'Return True if the string is a decimal string, False otherwise.\n\nA string is a decimal string if all characters in the string are decimal and\nthere is at least one character in the string.'
        ...
    
    def isdigit(self) -> typing.Any:
        'Return True if the string is a digit string, False otherwise.\n\nA string is a digit string if all characters in the string are digits and there\nis at least one character in the string.'
        ...
    
    def isidentifier(self) -> typing.Any:
        'Return True if the string is a valid Python identifier, False otherwise.\n\nCall keyword.iskeyword(s) to test whether string s is a reserved identifier,\nsuch as "def" or "class".'
        ...
    
    def islower(self) -> typing.Any:
        'Return True if the string is a lowercase string, False otherwise.\n\nA string is lowercase if all cased characters in the string are lowercase and\nthere is at least one cased character in the string.'
        ...
    
    def isnumeric(self) -> typing.Any:
        'Return True if the string is a numeric string, False otherwise.\n\nA string is numeric if all characters in the string are numeric and there is at\nleast one character in the string.'
        ...
    
    def isprintable(self) -> typing.Any:
        'Return True if the string is printable, False otherwise.\n\nA string is printable if all of its characters are considered printable in\nrepr() or if it is empty.'
        ...
    
    def isspace(self) -> typing.Any:
        'Return True if the string is a whitespace string, False otherwise.\n\nA string is whitespace if all characters in the string are whitespace and there\nis at least one character in the string.'
        ...
    
    def istitle(self) -> typing.Any:
        'Return True if the string is a title-cased string, False otherwise.\n\nIn a title-cased string, upper- and title-case characters may only\nfollow uncased characters and lowercase characters only cased ones.'
        ...
    
    def isupper(self) -> typing.Any:
        'Return True if the string is an uppercase string, False otherwise.\n\nA string is uppercase if all cased characters in the string are uppercase and\nthere is at least one cased character in the string.'
        ...
    
    def join(self, iterable) -> typing.Any:
        "Concatenate any number of strings.\n\nThe string whose method is called is inserted in between each given string.\nThe result is returned as a new string.\n\nExample: '.'.join(['ab', 'pq', 'rs']) -> 'ab.pq.rs'"
        ...
    
    def ljust(self, width, fillchar) -> typing.Any:
        'Return a left-justified string of length width.\n\nPadding is done using the specified fill character (default is a space).'
        ...
    
    def lower(self) -> typing.Any:
        'Return a copy of the string converted to lowercase.'
        ...
    
    def lstrip(self, chars) -> typing.Any:
        'Return a copy of the string with leading whitespace removed.\n\nIf chars is given and not None, remove characters in chars instead.'
        ...
    
    @classmethod
    def maketrans(cls) -> typing.Any:
        'Return a translation table usable for str.translate().\n\nIf there is only one argument, it must be a dictionary mapping Unicode\nordinals (integers) or characters to Unicode ordinals, strings or None.\nCharacter keys will be then converted to ordinals.\nIf there are two arguments, they must be strings of equal length, and\nin the resulting dictionary, each character in x will be mapped to the\ncharacter at the same position in y. If there is a third argument, it\nmust be a string, whose characters will be mapped to None in the result.'
        ...
    
    def partition(self, sep) -> typing.Any:
        'Partition the string into three parts using the given separator.\n\nThis will search for the separator in the string.  If the separator is found,\nreturns a 3-tuple containing the part before the separator, the separator\nitself, and the part after it.\n\nIf the separator is not found, returns a 3-tuple containing the original string\nand two empty strings.'
        ...
    
    def removeprefix(self, prefix) -> typing.Any:
        'Return a str with the given prefix string removed if present.\n\nIf the string starts with the prefix string, return string[len(prefix):].\nOtherwise, return a copy of the original string.'
        ...
    
    def removesuffix(self, suffix) -> typing.Any:
        'Return a str with the given suffix string removed if present.\n\nIf the string ends with the suffix string and that suffix is not empty,\nreturn string[:-len(suffix)]. Otherwise, return a copy of the original\nstring.'
        ...
    
    def replace(self, old, new, count) -> typing.Any:
        'Return a copy with all occurrences of substring old replaced by new.\n\n  count\n    Maximum number of occurrences to replace.\n    -1 (the default value) means replace all occurrences.\n\nIf the optional argument count is given, only the first count occurrences are\nreplaced.'
        ...
    
    def rfind(self, sub, start=..., end=...) -> int:
        'S.rfind(sub[, start[, end]]) -> int\n\nReturn the highest index in S where substring sub is found,\nsuch that sub is contained within S[start:end].  Optional\narguments start and end are interpreted as in slice notation.\n\nReturn -1 on failure.'
        ...
    
    def rindex(self, sub, start=..., end=...) -> int:
        'S.rindex(sub[, start[, end]]) -> int\n\nReturn the highest index in S where substring sub is found,\nsuch that sub is contained within S[start:end].  Optional\narguments start and end are interpreted as in slice notation.\n\nRaises ValueError when the substring is not found.'
        ...
    
    def rjust(self, width, fillchar) -> typing.Any:
        'Return a right-justified string of length width.\n\nPadding is done using the specified fill character (default is a space).'
        ...
    
    def rpartition(self, sep) -> typing.Any:
        'Partition the string into three parts using the given separator.\n\nThis will search for the separator in the string, starting at the end. If\nthe separator is found, returns a 3-tuple containing the part before the\nseparator, the separator itself, and the part after it.\n\nIf the separator is not found, returns a 3-tuple containing two empty strings\nand the original string.'
        ...
    
    def rsplit(self, sep, maxsplit) -> typing.Any:
        'Return a list of the substrings in the string, using sep as the separator string.\n\n  sep\n    The separator used to split the string.\n\n    When set to None (the default value), will split on any whitespace\n    character (including \\\\n \\\\r \\\\t \\\\f and spaces) and will discard\n    empty strings from the result.\n  maxsplit\n    Maximum number of splits (starting from the left).\n    -1 (the default value) means no limit.\n\nSplitting starts at the end of the string and works to the front.'
        ...
    
    def rstrip(self, chars) -> typing.Any:
        'Return a copy of the string with trailing whitespace removed.\n\nIf chars is given and not None, remove characters in chars instead.'
        ...
    
    def split(self, sep, maxsplit) -> typing.Any:
        'Return a list of the substrings in the string, using sep as the separator string.\n\n  sep\n    The separator used to split the string.\n\n    When set to None (the default value), will split on any whitespace\n    character (including \\\\n \\\\r \\\\t \\\\f and spaces) and will discard\n    empty strings from the result.\n  maxsplit\n    Maximum number of splits (starting from the left).\n    -1 (the default value) means no limit.\n\nNote, str.split() is mainly useful for data that has been intentionally\ndelimited.  With natural text that includes punctuation, consider using\nthe regular expression module.'
        ...
    
    def splitlines(self, keepends) -> typing.Any:
        'Return a list of the lines in the string, breaking at line boundaries.\n\nLine breaks are not included in the resulting list unless keepends is given and\ntrue.'
        ...
    
    def startswith(self, prefix, start=..., end=...) -> bool:
        'S.startswith(prefix[, start[, end]]) -> bool\n\nReturn True if S starts with the specified prefix, False otherwise.\nWith optional start, test S beginning at that position.\nWith optional end, stop comparing S at that position.\nprefix can also be a tuple of strings to try.'
        ...
    
    def strip(self, chars) -> typing.Any:
        'Return a copy of the string with leading and trailing whitespace removed.\n\nIf chars is given and not None, remove characters in chars instead.'
        ...
    
    def swapcase(self) -> typing.Any:
        'Convert uppercase characters to lowercase and lowercase characters to uppercase.'
        ...
    
    def title(self) -> typing.Any:
        'Return a version of the string where each word is titlecased.\n\nMore specifically, words start with uppercased characters and all remaining\ncased characters have lower case.'
        ...
    
    def translate(self, table) -> typing.Any:
        'Replace each character in the string using the given translation table.\n\n  table\n    Translation table, which must be a mapping of Unicode ordinals to\n    Unicode ordinals, strings, or None.\n\nThe table must implement lookup/indexing via __getitem__, for instance a\ndictionary or list.  If this operation raises LookupError, the character is\nleft untouched.  Characters mapped to None are deleted.'
        ...
    
    def upper(self) -> typing.Any:
        'Return a copy of the string converted to uppercase.'
        ...
    
    def zfill(self, width) -> typing.Any:
        'Pad a numeric string with zeros on the left, to fill a field of the given width.\n\nThe string is never truncated.'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

def sum(iterable, start) -> typing.Any:
    "Return the sum of a 'start' value (default: 0) plus an iterable of numbers\n\nWhen the iterable is empty, return the start value.\nThis function is intended specifically for use with numeric values and may\nreject non-numeric types."
    ...

class super(object):
    'super() -> same as super(__class__, <first argument>)\nsuper(type) -> unbound super object\nsuper(type, obj) -> bound super object; requires isinstance(obj, type)\nsuper(type, type2) -> bound super object; requires issubclass(type2, type)\nTypical use to call a cooperative superclass method:\nclass C(B):\n    def meth(self, arg):\n        super().meth(arg)\nThis works for class methods too:\nclass C(B):\n    @classmethod\n    def cmeth(cls, arg):\n        super().cmeth(arg)\n'
    def __get__(self, instance, owner) -> super:
        'Return an attribute of instance, which is of type owner.'
        ...
    
    def __getattribute__(self, name) -> typing.Any:
        'Return getattr(self, name).'
        ...
    
    def __init__(self, *args, **kwargs) -> None:
        'super() -> same as super(__class__, <first argument>)\nsuper(type) -> unbound super object\nsuper(type, obj) -> bound super object; requires isinstance(obj, type)\nsuper(type, type2) -> bound super object; requires issubclass(type2, type)\nTypical use to call a cooperative superclass method:\nclass C(B):\n    def meth(self, arg):\n        super().meth(arg)\nThis works for class methods too:\nclass C(B):\n    @classmethod\n    def cmeth(cls, arg):\n        super().cmeth(arg)\n'
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    def __repr__(self) -> str:
        'Return repr(self).'
        ...
    
    @property
    def __self__(self) -> typing.Any:
        'the instance invoking super(); may be None'
        ...
    
    @property
    def __self_class__(self) -> typing.Any:
        'the type of the instance invoking super(); may be None'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    @property
    def __thisclass__(self) -> typing.Any:
        'the class invoking super()'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class tuple(object):
    "Built-in immutable sequence.\n\nIf no argument is given, the constructor returns an empty tuple.\nIf iterable is specified the tuple is initialized from iterable's items.\n\nIf the argument is a tuple, the return value is the same object."
    def __add__(self, value) -> tuple:
        'Return self+value.'
        ...
    
    @classmethod
    def __class_getitem__(cls) -> typing.Any:
        'See PEP 585'
        ...
    
    def __contains__(self, key) -> bool:
        'Return key in self.'
        ...
    
    def __eq__(self, value) -> bool:
        'Return self==value.'
        ...
    
    def __ge__(self, value) -> bool:
        'Return self>=value.'
        ...
    
    def __getattribute__(self, name) -> typing.Any:
        'Return getattr(self, name).'
        ...
    
    def __getitem__(self, key) -> typing.Any:
        'Return self[key].'
        ...
    
    def __getnewargs__(self) -> typing.Tuple[tuple]:
        ...
    
    def __gt__(self, value) -> bool:
        'Return self>value.'
        ...
    
    def __hash__(self) -> int:
        'Return hash(self).'
        ...
    
    def __init__(self, *args, **kwargs) -> None:
        "Built-in immutable sequence.\n\nIf no argument is given, the constructor returns an empty tuple.\nIf iterable is specified the tuple is initialized from iterable's items.\n\nIf the argument is a tuple, the return value is the same object."
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    def __iter__(self) -> tuple:
        'Implement iter(self).'
        ...
    
    def __le__(self, value) -> bool:
        'Return self<=value.'
        ...
    
    def __len__(self) -> int:
        'Return len(self).'
        ...
    
    def __lt__(self, value) -> bool:
        'Return self<value.'
        ...
    
    def __mul__(self, value) -> tuple:
        'Return self*value.'
        ...
    
    def __ne__(self, value) -> bool:
        'Return self!=value.'
        ...
    
    def __repr__(self) -> str:
        'Return repr(self).'
        ...
    
    def __rmul__(self, value) -> tuple:
        'Return value*self.'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def count(self, value) -> typing.Any:
        'Return number of occurrences of value.'
        ...
    
    def index(self, value, start, stop) -> typing.Any:
        'Return first index of value.\n\nRaises ValueError if the value is not present.'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

class type(object):
    "type(object) -> the object's type\ntype(name, bases, dict, **kwds) -> a new type"
    __base__: object
    __bases__: typing.Tuple[type, ...]
    __basicsize__: int
    def __call__(self, *args, **kwargs) -> typing.Any:
        'Call self as a function.'
        ...
    
    def __delattr__(self, name) -> None:
        'Implement delattr(self, name).'
        ...
    
    __dict__: typing.Dict[str, typing.Any]
    __dictoffset__: int
    def __dir__(self) -> typing.Iterable[str]:
        'Specialized __dir__ implementation for types.'
        ...
    
    __flags__: int
    def __getattribute__(self, name) -> typing.Any:
        'Return getattr(self, name).'
        ...
    
    def __init__(self, *args, **kwargs) -> None:
        "type(object) -> the object's type\ntype(name, bases, dict, **kwds) -> a new type"
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    def __instancecheck__(self, instance) -> typing.Any:
        'Check if an object is an instance.'
        ...
    
    __itemsize__: int
    __mro__: typing.Tuple[type, ...]
    __name__: str
    def __or__(self, value) -> type:
        'Return self|value.'
        ...
    
    @classmethod
    def __prepare__(cls, name: str, bases: typing.Tuple[type, ...], **kwds: typing.Any) -> typing.Dict[typing.Any, typing.Any]:
        'used to create the namespace for the class statement'
        ...
    
    __qualname__: str
    def __repr__(self) -> str:
        'Return repr(self).'
        ...
    
    def __ror__(self, value) -> type:
        'Return value|self.'
        ...
    
    def __setattr__(self, name, value) -> None:
        'Implement setattr(self, name, value).'
        ...
    
    def __sizeof__(self) -> int:
        'Return memory consumption of the type object.'
        ...
    
    def __subclasscheck__(self, subclass) -> bool:
        'Check if a class is a subclass.'
        ...
    
    def __subclasses__(self) -> typing.Any:
        'Return a list of immediate subclasses.'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    __text_signature__: typing.Any
    __weakrefoffset__: int
    def mro(self) -> typing.Any:
        "Return a type's method resolution order."
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

def vars(object=...) -> typing.Dict[typing.Any, typing.Any]:
    'Without arguments, equivalent to locals().\nWith an argument, equivalent to object.__dict__.'
    ...

class zip(object):
    "zip(*iterables, strict=False) --> Yield tuples until an input is exhausted.\n\n   >>> list(zip('abcdefg', range(3), range(4)))\n   [('a', 0, 0), ('b', 1, 1), ('c', 2, 2)]\n\nThe zip object yields n-length tuples, where n is the number of iterables\npassed as positional arguments to zip().  The i-th element in every tuple\ncomes from the i-th iterable argument to zip().  This continues until the\nshortest argument is exhausted.\n\nIf strict is true and one of the arguments is exhausted before the others,\nraise a ValueError."
    def __getattribute__(self, name) -> typing.Any:
        'Return getattr(self, name).'
        ...
    
    def __init__(self, *iterables, strict=...) -> None:
        "zip(*iterables, strict=False) --> Yield tuples until an input is exhausted.\n\n   >>> list(zip('abcdefg', range(3), range(4)))\n   [('a', 0, 0), ('b', 1, 1), ('c', 2, 2)]\n\nThe zip object yields n-length tuples, where n is the number of iterables\npassed as positional arguments to zip().  The i-th element in every tuple\ncomes from the i-th iterable argument to zip().  This continues until the\nshortest argument is exhausted.\n\nIf strict is true and one of the arguments is exhausted before the others,\nraise a ValueError."
        ...
    
    @classmethod
    def __init_subclass__(cls) -> None:
        'This method is called when a class is subclassed.\n\nThe default implementation does nothing. It may be\noverridden to extend subclasses.\n'
        ...
    
    def __iter__(self) -> zip:
        'Implement iter(self).'
        ...
    
    def __next__(self) -> typing.Any:
        'Implement next(self).'
        ...
    
    def __reduce__(self) -> typing.Union[str, typing.Tuple[typing.Any, ...]]:
        'Return state information for pickling.'
        ...
    
    def __setstate__(self, state: typing.Any) -> None:
        'Set state information for unpickling.'
        ...
    
    @classmethod
    def __subclasshook__(cls, subclass: typing.Any) -> bool:
        'Abstract classes can override this to customize issubclass().\n\nThis is invoked early on by abc.ABCMeta.__subclasscheck__().\nIt should return True, False or NotImplemented.  If it returns\nNotImplemented, the normal algorithm is used.  Otherwise, it\noverrides the normal algorithm (and the outcome is cached).\n'
        ...
    
    def __getattr__(self, name) -> typing.Any:
        ...
    

def __getattr__(name) -> typing.Any:
    ...

